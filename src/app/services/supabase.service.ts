import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async getCurrentData(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('current_data')
        .select('location, temperature_2m, created_at')
        .in('location', ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'])
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }
}
