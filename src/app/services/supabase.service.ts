import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

// Interfaz para datos meteorológicos
interface WeatherData {
  location: string;
  temperature_2m: number;
  precipitation: number;
  created_at: string;
  timestamp: string;
  wind_speed_10m: number;
  relative_humidity_2m: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

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
        .select('location, temperature_2m, created_at, precipitation, timestamp, wind_speed_10m, relative_humidity_2m')
        .eq('location', location)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      const modifiedData = data.map((item: WeatherData) => {
        const date = new Date(item.created_at);
        date.setHours(date.getHours() + 2); // Agrega 2 horas
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
}
