using Microsoft.AspNetCore.Mvc;
using Supabase;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System.Globalization;
using System.Net.Http.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient();
builder.Services.AddSingleton(new Supabase.Client(
    builder.Configuration["SUPABASE_URL"],
    builder.Configuration["SUPABASE_KEY"]
));
var app = builder.Build();

app.MapGet("/api/update-meteo", async (
    IHttpClientFactory clientFactory,
    Supabase.Client supabase) =>
{
  var locations = new[]
  {
        new { name = "valdeolmos", lat = 40.637, lon = -3.456 },
        new { name = "algete", lat = 40.597, lon = -3.497 },
        new { name = "el_casar", lat = 40.705, lon = -3.428 },
        new { name = "fuente_el_saz", lat = 40.632, lon = -3.511 }
    };

  var client = clientFactory.CreateClient();
  foreach (var loc in locations)
  {
    var url = $"https://api.open-meteo.com/v1/forecast?latitude={loc.lat.ToString(CultureInfo.InvariantCulture)}&longitude={loc.lon.ToString(CultureInfo.InvariantCulture)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,dewpoint_2m,shortwave_radiation&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m,et0_fao_evapotranspiration,shortwave_radiation,dewpoint_2m";
    try
    {
      var responseMessage = await client.GetAsync(url);
      responseMessage.EnsureSuccessStatusCode();
      var response = await responseMessage.Content.ReadFromJsonAsync<meteo_response>();
      if (response == null) return Results.Problem($"respuesta nula de open-meteo para {loc.name}");

      await supabase.From<current_data>().Insert(new current_data
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
      });

      for (int i = 0; i < response.hourly.time.Length; i++)
      {
        await supabase.From<forecast_data>().Insert(new forecast_data
        {
          location = loc.name,
          timestamp = DateTime.Parse(response.hourly.time[i]),
          temperature_2m = response.hourly.temperature_2m[i],
          relative_humidity_2m = response.hourly.relative_humidity_2m[i],
          precipitation = response.hourly.precipitation[i],
          wind_speed_10m = response.hourly.wind_speed_10m[i],
          wind_direction_10m = response.hourly.wind_direction_10m[i],
          et0_fao_evapotranspiration = response.hourly.et0_fao_evapotranspiration[i],
          shortwave_radiation = response.hourly.shortwave_radiation[i],
          dewpoint_2m = response.hourly.dewpoint_2m[i],
          created_at = DateTime.UtcNow
        });
      }
    }
    catch (HttpRequestException ex)
    {
      var errorResponse = await client.GetAsync(url).Result.Content.ReadAsStringAsync() ?? "sin detalle";
      return Results.Problem($"error en open-meteo para {loc.name}: {ex.Message}. URL: {url}. Detalle: {errorResponse}");
    }
  }

  var cutoff = DateTime.UtcNow.AddHours(-24).ToString("yyyy-MM-dd'T'HH:mm:ss'Z'");
  Console.WriteLine($"Cutoff for deletion: {cutoff}");

  // Depurar registros antes de eliminar
  var currentData = await supabase.From<current_data>()
      .Select("*")
      .Get();
  var forecastData = await supabase.From<forecast_data>()
      .Select("*")
      .Get();
  Console.WriteLine($"Current data records before deletion: {currentData.Models.Count}");
  Console.WriteLine($"Forecast data records before deletion: {forecastData.Models.Count}");

  await supabase.From<current_data>()
      .Filter("created_at", Supabase.Postgrest.Constants.Operator.LessThan, cutoff)
      .Delete();
  await supabase.From<forecast_data>()
      .Filter("created_at", Supabase.Postgrest.Constants.Operator.LessThan, cutoff)
      .Delete();

  // Depurar registros después de eliminar
  currentData = await supabase.From<current_data>()
      .Select("*")
      .Get();
  forecastData = await supabase.From<forecast_data>()
      .Select("*")
      .Get();
  Console.WriteLine($"Current data records after deletion: {currentData.Models.Count}");
  Console.WriteLine($"Forecast data records after deletion: {forecastData.Models.Count}");

  return Results.Ok("datos actualizados");
});

app.Run();

[Table("current_data")]
public class current_data : BaseModel
{
  [PrimaryKey]
  public int id { get; set; }
  public string location { get; set; }
  public DateTime timestamp { get; set; }
  public float temperature_2m { get; set; }
  public int relative_humidity_2m { get; set; }
  public float precipitation { get; set; }
  public float wind_speed_10m { get; set; }
  public int wind_direction_10m { get; set; }
  public float dewpoint_2m { get; set; }
  public float shortwave_radiation { get; set; }
  public float soil_moisture_0_to_10cm { get; set; }
  public float soil_temperature_0_to_10cm { get; set; }
  [Column("created_at")]
  public DateTime created_at { get; set; }
}

[Table("forecast_data")]
public class forecast_data : BaseModel
{
  [PrimaryKey]
  public int id { get; set; }
  public string location { get; set; }
  public DateTime timestamp { get; set; }
  public float temperature_2m { get; set; }
  public int relative_humidity_2m { get; set; }
  public float precipitation { get; set; }
  public float wind_speed_10m { get; set; }
  public int wind_direction_10m { get; set; }
  public float et0_fao_evapotranspiration { get; set; }
  public float shortwave_radiation { get; set; }
  public float soil_moisture_0_to_10cm { get; set; }
  public float soil_temperature_0_to_10cm { get; set; }
  public float dewpoint_2m { get; set; }
  [Column("created_at")]
  public DateTime created_at { get; set; }
}

public record meteo_response
{
  public current current { get; set; }
  public hourly hourly { get; set; }
}

public record current
{
  public float temperature_2m { get; set; }
  public int relative_humidity_2m { get; set; }
  public float precipitation { get; set; }
  public float wind_speed_10m { get; set; }
  public int wind_direction_10m { get; set; }
  public float dewpoint_2m { get; set; }
  public float shortwave_radiation { get; set; }
}

public record hourly
{
  public string[] time { get; set; }
  public float[] temperature_2m { get; set; }
  public int[] relative_humidity_2m { get; set; }
  public float[] precipitation { get; set; }
  public float[] wind_speed_10m { get; set; }
  public int[] wind_direction_10m { get; set; }
  public float[] et0_fao_evapotranspiration { get; set; }
  public float[] shortwave_radiation { get; set; }
  public float[] dewpoint_2m { get; set; }
}
