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
                new { name = "valdeolmos", lat = 40.6371, lon = -3.4562 },
                new { name = "algete", lat = 40.5961, lon = -3.4974 },
                new { name = "el_casar", lat = 40.7050, lon = -3.4280 },
                new { name = "fuente_el_saz", lat = 40.6328, lon = -3.5139 }
            };

            try
            {
                // Eliminar todos los registros de current_data
                var currentDataBefore = await _supabase.From<current_data>().Select("*").Get();
                Console.WriteLine($"Current data records before deletion: {currentDataBefore.Models.Count}");
                await _supabase.From<current_data>().Delete();
                Console.WriteLine("All records in current_data deleted.");

                // Eliminar todos los registros de forecast_data (equivalente a TRUNCATE)
                var forecastDataBefore = await _supabase.From<forecast_data>().Select("*").Get();
                Console.WriteLine($"Forecast data records before deletion: {forecastDataBefore.Models.Count}");
                await _supabase.From<forecast_data>().Delete();
                Console.WriteLine("All records in forecast_data deleted.");

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

                        // Insertar datos actuales en current_data
                        var currentData = new current_data
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

                        await _supabase.From<current_data>().Insert(currentData);

                        // Insertar datos de pronóstico en forecast_data
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

                // Verificar registros después de la inserción
                var currentDataAfter = await _supabase.From<current_data>().Select("*").Get();
                var forecastDataAfter = await _supabase.From<forecast_data>().Select("*").Get();
                Console.WriteLine($"Current data records after insertion: {currentDataAfter.Models.Count}");
                Console.WriteLine($"Forecast data records after insertion: {forecastDataAfter.Models.Count}");

                return Ok("Datos actualizados correctamente");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno al actualizar datos: {ex.Message}");
            }
        }
    }
}