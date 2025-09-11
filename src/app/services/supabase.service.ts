import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

constructor() {
      // ✅ Logs añadidos para depuración
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

  async getDataByLocation(location: string): Promise<any[]> {
    try {
      console.log('Fetching data for location:', location); // Depuración
      const { data, error } = await this.supabase
        .from('current_data')
        .select('location, temperature_2m, created_at')
        .eq('location', location)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      console.log('Data fetched:', data); // Depuración
      return data || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }
}
