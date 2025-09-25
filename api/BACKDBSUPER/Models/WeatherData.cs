using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using System;

namespace BACKDBSUPER.Models
{
    [Table("current_data")]
    public class current_data : BaseModel
    {
        [PrimaryKey]
        public int id { get; set; }
        public string? location { get; set; }
        public DateTime? timestamp { get; set; }
        public float temperature_2m { get; set; }
        public int relative_humidity_2m { get; set; }
        public float precipitation { get; set; }
        public float wind_speed_10m { get; set; }
        public int wind_direction_10m { get; set; }

        public float? et0_fao_evapotranspiration { get; set; }

        public float shortwave_radiation { get; set; }
        public float dewpoint_2m { get; set; }
       public float? soil_moisture_0_to_10cm { get; set; }
        public float? soil_temperature_0_to_10cm { get; set; }

        public int? weathercode { get; set; }
        public int? is_day { get; set; }
        public float? cloudcover { get; set; }
        public float? visibility { get; set; }
        public float? wind_gusts_10m { get; set; }
        public float? snowfall { get; set; }
        public float? apparent_temperature { get; set; }
        public float? precipitation_probability { get; set; }





        [Column("created_at")]
        public DateTime created_at { get; set; }
    }

    [Table("forecast_data")]
    public class forecast_data : BaseModel
    {
        [PrimaryKey]
        public int id { get; set; }
        public string? location { get; set; }
        public DateTime? timestamp { get; set; }
        public float temperature_2m { get; set; }
        public int relative_humidity_2m { get; set; }
        public float precipitation { get; set; }
        public float wind_speed_10m { get; set; }
        public int wind_direction_10m { get; set; }
        public float et0_fao_evapotranspiration { get; set; }
        public float shortwave_radiation { get; set; }
        public float dewpoint_2m { get; set; }
        public float soil_moisture_0_to_10cm { get; set; }
        public float soil_temperature_0_to_10cm { get; set; }
        public int weathercode { get; set; }
        public int is_day { get; set; }
        public float cloudcover { get; set; }
        public float visibility { get; set; }
        public float wind_gusts_10m { get; set; }
        public float snowfall { get; set; }
        public float apparent_temperature { get; set; }
        public float precipitation_probability { get; set; }

        [Column("created_at")]
        public DateTime created_at { get; set; }
    }

    public class meteo_response
    {
        public current? current { get; set; }
        public hourly? hourly { get; set; }
    }

  public class current
  {
    public int id { get; set; }
    public string? location { get; set; }
    public float temperature_2m { get; set; }
    public int relative_humidity_2m { get; set; }
    public float precipitation { get; set; }
    public float wind_speed_10m { get; set; }
    public int wind_direction_10m { get; set; }
    public float dewpoint_2m { get; set; }
    public float shortwave_radiation { get; set; }

    public int weathercode { get; set; }
    public int is_day { get; set; }
    public float cloudcover { get; set; }
    public float visibility { get; set; }
    public float wind_gusts_10m { get; set; }
    public float snowfall { get; set; }
    public float apparent_temperature { get; set; }
    public float precipitation_probability { get; set; }

    public float et0_fao_evapotranspiration { get; set; }


    }

  public class hourly
  {
    public string[]? time { get; set; }
    public float[]? temperature_2m { get; set; }
    public int[]? relative_humidity_2m { get; set; }
    public float[]? precipitation { get; set; }
    public float[]? wind_speed_10m { get; set; }
    public int[]? wind_direction_10m { get; set; }
    public float[]? et0_fao_evapotranspiration { get; set; }
    public float[]? shortwave_radiation { get; set; }
    public float[]? dewpoint_2m { get; set; }
    public float[]? soil_moisture_0_to_10cm { get; set; }
    public float[]? soil_temperature_0_to_10cm { get; set; }

    public int[]? weathercode { get; set; }
    public int[]? is_day { get; set; }
    public float[]? cloudcover { get; set; }
    public float[]? visibility { get; set; }
    public float[]? wind_gusts_10m { get; set; }
    public float[]? snowfall { get; set; }
    public float[]? apparent_temperature { get; set; }
    public float[]? precipitation_probability { get; set; }



    }
}
