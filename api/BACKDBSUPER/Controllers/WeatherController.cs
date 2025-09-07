using BACKDBSUPER.Models;
using Microsoft.AspNetCore.Mvc;
using Supabase;
using System.Globalization;

namespace BACKDBSUPER.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly Supabase.Client _supabase;

        public WeatherController(HttpClient httpClient, Supabase.Client supabase)
        {
            _httpClient = httpClient;
            _supabase = supabase;
        }

        [HttpGet("update-meteo")]
        public async Task<IActionResult> UpdateMeteo()
        {
            var locations = new[]
            {
                new { name = "valdeolmos", lat = 40.637, lon = -3.456 },
                new { name = "algete", lat = 40.597, lon = -3.497 },
                new { name = "el_casar", lat = 40.705, lon = -3.428 },
                new { name = "fuente_el_saz", lat = 40.632, lon = -3.511 }
            };

            foreach (var loc in locations)
            {
                var url = $"https://api.open-meteo.com/v1/forecast?latitude={loc.lat.ToString(CultureInfo.InvariantCulture)}&longitude={loc.lon.ToString(CultureInfo.InvariantCulture)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,dewpoint_2m,shortwave_radiation&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,et0_fao_evapotranspiration,shortwave_radiation,dewpoint_2m,soil_moisture_0_to_10cm,soil_temperature_0_to_10cm&timezone=auto";

                try
                {
                    var response = await _httpClient.GetFromJsonAsync<meteo_response>(url);
                    if (response == null || response.current == null || response.hourly == null)
                    {
                        return BadRequest($"Error fetching data from Open-Meteo for {loc.name}");
                    }

                    var current_Data = new current_data
                    {
                        location = loc.name,
                        timestamp = DateTime.UtcNow,
                        temperature_2m = response.current.temperature_2m,
                        relative_humidity_2m = response.current.relative_humidity_2m,
                        precipitation = response.current.precipitation,
                        wind_speed_10m = response.current.wind_speed_10m,
                        wind_direction_10m = response.current.wind_direction_10m,
                        dewpoint_2m = response.current.dewpoint_2m,
                        shortwave_radiation = response.current.shortwave_radiation,
                        created_at = DateTime.UtcNow
                    };

                    await _supabase.From<current_data>().Insert(current_Data);

                    for (int i = 0; i < response.hourly.time?.Length; i++)
                    {
                        await _supabase.From<forecast_data>().Insert(new forecast_data
                        {
                            location = loc.name,
                            timestamp = DateTime.Parse(response.hourly.time[i]),
                            temperature_2m = response.hourly.temperature_2m?[i] ?? 0,
                            relative_humidity_2m = response.hourly.relative_humidity_2m?[i] ?? 0,
                            precipitation = response.hourly.precipitation?[i] ?? 0,
                            wind_speed_10m = response.hourly.wind_speed_10m?[i] ?? 0,
                            wind_direction_10m = response.hourly.wind_direction_10m?[i] ?? 0,
                            et0_fao_evapotranspiration = response.hourly.et0_fao_evapotranspiration?[i] ?? 0,
                            shortwave_radiation = response.hourly.shortwave_radiation?[i] ?? 0,
                            dewpoint_2m = response.hourly.dewpoint_2m?[i] ?? 0,
                            soil_moisture_0_to_10cm = response.hourly.soil_moisture_0_to_10cm?[i] ?? 0,
                            soil_temperature_0_to_10cm = response.hourly.soil_temperature_0_to_10cm?[i] ?? 0,
                            created_at = DateTime.UtcNow
                        });
                    }
                }
                catch (HttpRequestException ex)
                {
                    var errorResponse = await _httpClient.GetAsync(url).ContinueWith(t => t.Result.Content.ReadAsStringAsync()).Result ?? "sin detalle";
                    return BadRequest($"Error en Open-Meteo para {loc.name}: {ex.Message}. URL: {url}. Detalle: {errorResponse}");
                }
            }

            var cutoff = DateTime.UtcNow.AddHours(-24).ToString("yyyy-MM-dd'T'HH:mm:ss'Z'");
            Console.WriteLine($"Cutoff for deletion: {cutoff}");

            var currentData = await _supabase.From<current_data>().Select("*").Get();
            var forecastData = await _supabase.From<forecast_data>().Select("*").Get();
            Console.WriteLine($"Current data records before deletion: {currentData.Models.Count}");
            Console.WriteLine($"Forecast data records before deletion: {forecastData.Models.Count}");

            await _supabase.From<current_data>().Filter("created_at", Supabase.Postgrest.Constants.Operator.LessThan, cutoff).Delete();
            await _supabase.From<forecast_data>().Filter("created_at", Supabase.Postgrest.Constants.Operator.LessThan, cutoff).Delete();

            currentData = await _supabase.From<current_data>().Select("*").Get();
            forecastData = await _supabase.From<forecast_data>().Select("*").Get();
            Console.WriteLine($"Current data records after deletion: {currentData.Models.Count}");
            Console.WriteLine($"Forecast data records after deletion: {forecastData.Models.Count}");

            return Ok("datos actualizados");
        }
    }
}