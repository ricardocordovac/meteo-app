import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { WeatherData } from '../interfaces/weather-data.interface'; // Importa la interfaz

// Interfaz para datos meteorológicos
// interface WeatherData {
//   location: string;
//   temperature_2m: number;
//   precipitation: number;
//   created_at: string;
//   timestamp: string;
//   wind_speed_10m: number;
//   relative_humidity_2m: number;
//   shortwave_radiation: number;
//   wind_direction_10m: number;
//   weathercode: number;
//   is_day: number;
//   cloudcover: number;
//   visibility: number;
//   wind_gusts_10m: number;
//   snowfall: number;
//   apparent_temperature: number;
//   precipitation_probability: number;
//   et0_fao_evapotranspiration: number;
//   soil_moisture_0_to_10cm: number;
//   soil_temperature_0_to_10cm: number;
//   dewpoint_2m: number;
// }

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    console.log('Supabase URL:', environment.supabaseUrl);
    console.log('Supabase Key:', environment.supabaseKey);
    console.log('Environment:', environment);
    if (!environment.supabaseUrl || !environment.supabaseKey) {
      throw new Error('Supabase URL or Key is missing');
    }
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('Supabase initialized:', this.supabase);
  }

  async getDataByLocation(location: string): Promise<WeatherData[]> {
    try {
      console.log('Fetching data for location:', location);
      const { data, error } = await this.supabase
        .from('current_data')
        .select('location, temperature_2m, created_at, precipitation, timestamp, wind_speed_10m, relative_humidity_2m, wind_direction_10m, shortwave_radiation, weathercode, is_day, cloudcover, visibility, wind_gusts_10m, snowfall, apparent_temperature, precipitation_probability, et0_fao_evapotranspiration, soil_moisture_0_to_10cm, soil_temperature_0_to_10cm, dewpoint_2m, background_image_url')
        .eq('location', location)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const modifiedData = data.map((item: WeatherData) => {
        // const date = new Date(item.created_at || '');
        // date.setHours(date.getHours() + 1); // Agrega 2 horas
        const date = new Date(item.created_at || '');
      const offset = this.getMadridTimezoneOffset(date);
      date.setHours(date.getHours() + offset);
        return {
          ...item,
          created_at: date.toISOString()
        };
      });

      console.log('Data fetched and modified:', modifiedData);
      return modifiedData || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }

  // Método auxiliar para obtener el offset de zona horaria de Madrid
private getMadridTimezoneOffset(date: Date): number {
  const formatter = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Madrid', timeZoneName: 'short' });
  const parts = formatter.formatToParts(date);
  const offsetPart = parts.find(part => part.type === 'timeZoneName');
  const offsetStr = offsetPart ? offsetPart.value : 'GMT+1'; // Fallback a CET
  const offsetHours = offsetStr.includes('CEST') ? 2 : 1; // CEST = +2, CET = +1
  console.log('Date:', date.toISOString(), 'Offset:', offsetHours, 'Timezone:', offsetStr); // Depuración
  return offsetHours;
}

// Método auxiliar para determinar el offset de zona horaria
// private getTimezoneOffset(date: Date): number {
//   const year = date.getUTCFullYear();
//   // Calcular el último domingo de marzo
//   const lastSundayMarch = new Date(year, 2, 1); // Primer día de marzo
//   lastSundayMarch.setDate(31 - ((lastSundayMarch.getDay() + 6) % 7)); // Último domingo de marzo
//   // Calcular el último domingo de octubre
//   const lastSundayOctober = new Date(year, 9, 1); // Primer día de octubre
//   lastSundayOctober.setDate(31 - ((lastSundayOctober.getDay() + 6) % 7)); // Último domingo de octubre

//   // CEST (UTC+2) si está entre el último domingo de marzo y el último domingo de octubre (exclusivo)
//   // Cambiamos a CET (UTC+1) a partir del último domingo de octubre a las 3:00 AM
//   if (date >= lastSundayMarch && date < lastSundayOctober) {
//     return 2; // +2 horas para CEST
//   } else if (date >= lastSundayOctober && date.getUTCHours() >= 3) {
//     return 1; // +1 hora para CET, después de las 3:00 AM del último domingo de octubre
//   }
//   return 1; // +1 hora para CET en otros casos (antes de marzo)
// }

// Nueva función migrada de meteo.service.ts
async getMeteoCondition(location: string): Promise<any> {
  try {
    const weatherData = await this.getDataByLocation(location);
   // const weatherData = await this.getDataByLocation("madrid");

    if (!weatherData.length) return null;

    const data = weatherData[0] as WeatherData;
    const { data: conditions, error } = await this.supabase
      .from('negociometeorologico')
      .select('*');

    if (error) throw error;

    const matchedCondition = conditions.find(condition =>
      this.matchCondition(condition, data)
    );

    if (matchedCondition) {
      const createdAt = new Date(data.created_at || '');
      // if (createdAt instanceof Date && createdAt.toString() !== 'Invalid Date') {
      //   createdAt.setHours(createdAt.getHours() + 2); // Ajuste CEST
      // }

      return {
        ...matchedCondition,
        created_at: createdAt.toISOString(), // Incluimos created_at ajustado
        background: matchedCondition.image_url || `assets/backgrounds/${matchedCondition.tipo_clima}.jpg`,
        description: matchedCondition.descripcion,
        location: data.location,
        temp: data.temperature_2m || 'N/A',
        apparentTemp: data.apparent_temperature || 'N/A',
        precipitation: data.precipitation || 'N/A',
        windSpeed: data.wind_speed_10m || 'N/A',
        isDay: data.is_day,
        background_image_url:data.background_image_url,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching meteo condition:', error);
    return {
      location: location,
      temp: 'N/A',
      apparentTemp: 'N/A',
      precipitation: 'N/A',
      windSpeed: 'N/A',
      isDay: 0,
      created_at: new Date().toISOString(), // Fallback con ajuste
      background: '/assets/backgrounds/soleado.png',
      background_image_url:'/assets/backgrounds/soleado.png',
    };
  }
}
  // async getMeteoCondition(location: string): Promise<any> {
  //   try {
  //     const weatherData = await this.getDataByLocation(location);
  //     if (!weatherData.length) return null;

  //     const data = weatherData[0] as WeatherData;

  //     const { data: conditions, error } = await this.supabase
  //       .from('negociometeorologico') // Ajustado a minúsculas basado en el error anterior
  //       .select('*');

  //     if (error) throw error;

  //     const matchedCondition = conditions.find(condition =>
  //       this.matchCondition(condition, data)
  //     );

  //     if (matchedCondition) {
  //     const createdAt = new Date(data.created_at || '');
  //     if (createdAt instanceof Date && createdAt.toString() !== 'Invalid Date') {
  //       createdAt.setHours(createdAt.getHours() + 2); // Ajuste CEST
  //     }

  //       return {
  //         ...matchedCondition,
  //         created_at: createdAt.toISOString(), // Incluimos created_at ajustado
  //         background: `/assets/backgrounds/${matchedCondition.ia_generate_prompt_background.split(',')[0].trim().split(' ')[0]}.png`,
  //         description: matchedCondition.descripcion,
  //         location: data.location,
  //         temp: data.temperature_2m || 'N/A',
  //         apparentTemp: data.apparent_temperature || 'N/A',
  //         precipitation: data.precipitation || 'N/A',
  //         windSpeed: data.wind_speed_10m || 'N/A',
  //         isDay: data.is_day
  //       };
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Error fetching meteo condition:', error);
  //     return {
  //       location: location,
  //       temp: 'N/A',
  //       apparentTemp: 'N/A',
  //       precipitation: 'N/A',
  //       windSpeed: 'N/A',
  //       isDay: 0,
  //       background: '/assets/backgrounds/soleado.png'
  //     };
  //   }
  // }

  // Método auxiliar migrado
  // Lógica para coincidir datos con condicionante_where
  private matchCondition(condition: any, weatherData: WeatherData): boolean {
    const whereClause = condition.condicionante_where.toLowerCase();
    const conditions = whereClause.split('and').map((c: string) => c.trim());

      return conditions.every((conditionStr: string) => {
      if (conditionStr.includes('temperature_2m')) {
        return this.evaluateNumeric('temperature_2m', conditionStr, weatherData.temperature_2m);
      } else if (conditionStr.includes('wind_speed_10m')) {
        return this.evaluateNumeric('wind_speed_10m', conditionStr, weatherData.wind_speed_10m);
      } else if (conditionStr.includes('precipitation')) {
        return this.evaluateNumeric('precipitation', conditionStr, weatherData.precipitation);
      } else if (conditionStr.includes('cloudcover')) {
        return this.evaluateNumeric('cloudcover', conditionStr, weatherData.cloudcover);
      } else if (conditionStr.includes('visibility')) {
        return this.evaluateNumeric('visibility', conditionStr, weatherData.visibility);
      } else if (conditionStr.includes('is_day')) {
        return this.evaluateBoolean('is_day', conditionStr, weatherData.is_day);
      } else if (conditionStr.includes('weathercode')) {
        return this.evaluateWeatherCode(conditionStr, weatherData.weathercode);
      }
      return true; // Si no hay condición relevante, asumir true
    });
  }

  // Métodos auxiliares migrados

  private evaluateNumeric(field: string, clause: string, value?: number): boolean {
    if (value === undefined || value === null) return false;
    if (clause.includes('<')) {
      const threshold = parseFloat(clause.split('<')[1] || '0'); // Manejo de undefined
      return value < threshold;
    } else if (clause.includes('>')) {
      const threshold = parseFloat(clause.split('>')[1] || '0');
      return value > threshold;
    } else if (clause.includes('between')) {
      const matches = clause.match(/\d+\.?\d*/g) || ['0', '0'];
      const min = parseFloat(matches[0]);
      const max = parseFloat(matches[1] || matches[0]);
      return value >= min && value <= max;
    }
    return false;
  }
 private evaluateBoolean(field: string, clause: string, value?: number): boolean {
    if (value === undefined || value === null) return false;
    const expected = parseInt(clause.split('=')[1] || '0');
    return value === expected;
  }

  private evaluateWeatherCode(clause: string, weathercode?: number): boolean {
    if (weathercode === undefined || weathercode === null) return false;
    const ranges = clause.match(/\d+(?:-\d+)?/g) || [];
    return ranges.some(range => {
      const [min, max] = range.includes('-') ? range.split('-').map(Number) : [parseInt(range), parseInt(range)];
      return weathercode >= min && weathercode <= (max || min);
    });
  }

}

