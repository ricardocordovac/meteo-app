import { AnimationOptions } from 'ngx-lottie';

// =========================================================================
// 1. DTO CRUD / SUPABASE (Mapeo directo 1:1 con la BD en snake_case)
// =========================================================================
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
  outfit_image_url?: string;
  pronostico_meteo?: string;
  pronostico_hitos?: string;
  uv_index?: number;
  pressure_msl?: number;
  text_clothing?: string;
  precip_rate?: number | string;
  precip_total?: number | string;
  station_id_used?: string;
  alerts_jsonb?: string | AlertaCualitativa[]; // 🎯 Soporta String de C# o Array de Supabase
}

// =========================================================================
// 2. MODELOS DE NEGOCIO Y ESTRUCTURAS INTERNAS (C# + Open-Meteo)
// =========================================================================

/** 🎯 Estructura estricta para las Alertas Cualitativas creadas por el C# */
export interface AlertaCualitativa {
  id: string;
  tipo: 'peligro' | 'aviso' | 'hogar' | 'agricola' | 'salud' | 'info' | string;
  icono: string;
  titulo: string;
  mensaje: string;
}

/** 🕒 Estructura estricta para cada hora del carrusel/hitos */
export interface HourlyForecast {
  time: string;                     // "2026-08-15T17:00"
  hora?: string;                    // Viene directo del Backend C# (Ej: "19:00")
  horaFormatted?: string;           // Helper inyectado en Front: "17:00"
  temperature_2m: number;
  apparent_temperature: number;
  wind_gusts_10m: number;
  precipitation_probability: number;
  precipitation: number;
  relative_humidity_2m: number;
  dewpoint_2m: number;
  cloudcover: number;
  weathercode: number;
  is_day: number;
  background_image_url: string;
  outfit_image_url?: string;
  lottieOptions?: AnimationOptions; // Inyectado dinámicamente en Front
}

// =========================================================================
// 3. MODELO MAESTRO DE ESTADO PARA LA UI (Angular State)
// =========================================================================
export interface WeatherLocationData {
  location: string;
  date: Date | null;
  time: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  soilMoisture: number;
  pressure: number;
  weathercode: number;
  isDay: number;
  background_image_url: string;
  outfit_image_url: string;
  text_clothing: string;
  accessories: string[];
  primaryLottieOptions: AnimationOptions;
  pronostico_meteo: HourlyForecast[];
  pronostico_hitos: HourlyForecast[];
  alertas: AlertaCualitativa[];    // 🚨 Array tipado consumido por el HTML
  precip_rate?: number;
  precip_total?: number;
  station_id_used?: string;
}
