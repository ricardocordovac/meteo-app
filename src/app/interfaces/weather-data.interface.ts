// weather-data.interface.ts
export interface WeatherData {
  location?: string;
  temperature_2m?: number;
  precipitation?: number;
  created_at?: string;
  timestamp?: string;
  wind_speed_10m?: number;
  relative_humidity_2m?: number;
  shortwave_radiation?: number;
  wind_direction_10m?: number;
  weathercode?: number;
  is_day?: number;
  cloudcover?: number;
  visibility?: number;
  wind_gusts_10m?: number;
  snowfall?: number;
  apparent_temperature?: number;
  precipitation_probability?: number;
  et0_fao_evapotranspiration?: number;
  soil_moisture_0_to_10cm?: number;
  soil_temperature_0_to_10cm?: number;
  dewpoint_2m?: number;
  background_image_url?: string;
}
