import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { WeatherData } from '../interfaces/weather-data.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeteoroService {
  constructor(private supabaseService: SupabaseService) {}

  // Obtener condición meteorológica basada en datos y tabla NegocioMeteorologico
  async getMeteoCondition(location: string): Promise<any> {
    try {
      // Obtener datos climáticos en tiempo real
      const weatherData = await this.supabaseService.getDataByLocation(location);
      if (!weatherData.length) return null;

      const data = weatherData[0] as WeatherData;

      // Usar el cliente Supabase a través de SupabaseService
      const { data: conditions, error } = await this.supabaseService.supabase
        .from('negociometeorológico')
        .select('*');

      if (error) throw error;

      const matchedCondition = conditions.find(condition =>
        this.matchCondition(condition, data)
      );

      if (matchedCondition) {
        return {
          ...matchedCondition,
          bbackground: matchedCondition.image_url || `${matchedCondition.tipo_clima}.jpg`,
          background_image_url: data.background_image_url ||  '/assets/backgrounds/soleado.jpg',
          description: matchedCondition.descripcion,
          location: data.location,
          temp: data.temperature_2m || 'N/A',
          apparentTemp: data.apparent_temperature || 'N/A',
          precipitation: data.precipitation || 'N/A',
          windSpeed: data.wind_speed_10m || 'N/A',
          isDay: data.is_day
        };
      }
      return null;
    } catch (error) {
      console.error('Error en MeteoroService:', error);
      return null;
    }
  }

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

  // === OBTENER CLIMA ACTUAL (NUEVO MÉTODO) ===
  async getCurrentWeather(location: string): Promise<WeatherData | null> {
    try {
      const weatherData = await this.supabaseService.getDataByLocation(location);
      if (!weatherData.length) return null;

      return weatherData[0] as WeatherData;
    } catch (error) {
      console.error('Error obteniendo clima actual:', error);
      return null;
    }
  }

}
