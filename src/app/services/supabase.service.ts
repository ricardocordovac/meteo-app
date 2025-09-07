import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdsirweaayrcqhyuxoxa.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc2lyd2VhYXlyY3FoeXV4b3hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzE1MjIsImV4cCI6MjA3MjYwNzUyMn0.HsfMniSLxS7whm74kgajcA8fxwPIcR9-3kFTE1brDVU';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  async getCurrentData() {
    const { data, error } = await this.supabase
      .from('current_data')
      .select('location, temperature_2m, created_at')
      .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
      .order('created_at', { ascending: false })
      .limit(4);
    if (error) throw error;
    return data;
  }
}
