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
      console.log('Fetching data for location:', location);
      const { data, error } = await this.supabase
        .from('current_data')
        .select('location, temperature_2m, created_at, precipitation, timestamp')
        .eq('location', location)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      // ✅ Nuevo código para modificar la fecha antes de devolver los datos
      const modifiedData = data.map(item => {
        const date = new Date(item.created_at);
        date.setHours(date.getHours() + 2); // Agrega 2 horas
        return {
          ...item,
          created_at: date.toISOString() // Guarda la fecha como un string ISO para consistencia
        };
      });

      console.log('Data fetched and modified:', modifiedData);
      return modifiedData || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }


  // Para pronósticos (obtiene el bloque más reciente)
  // async getDataByLocationForecast(location: string): Promise<any[]> {
  //   try {
  //     console.log('Fetching forecast data for location:', location);

  //     const { data: latestCreatedAtData, error: latestError } = await this.supabase
  //       .from('forecast_data')
  //       .select('created_at')
  //       .eq('location', location)
  //       .order('created_at', { ascending: false })
  //       .limit(30);

  //     if (latestError) throw latestError;
  //     if (!latestCreatedAtData || latestCreatedAtData.length === 0) {
  //       console.log('No forecast data found for location:', location);
  //       return [];
  //     }

  //     const latestCreatedAt = latestCreatedAtData[0].created_at;

  //     const { data, error } = await this.supabase
  //       .from('forecast_data')
  //       .select('timestamp, location, temperature_2m, precipitation, created_at')
  //       .eq('location', location)
  //       .eq('created_at', latestCreatedAt)
  //       .order('timestamp', { ascending: true });

  //     if (error) throw error;

  //     console.log('Forecast data fetched:', data);
  //     return data || [];
  //   } catch (error) {
  //     console.error('Supabase error:', error);
  //     return [];
  //   }
  // }




  // ✅ Función modificada para obtener todos los registros de pronósticos por ubicación
  async getDataByLocationForecast(location: string): Promise<any[]> {
    try {
      console.log('Fetching forecast data for location:', location);

      // Consulta para obtener todos los registros filtrados por location
      const { data, error } = await this.supabase
        .from('forecast_data')
        .select('location, temperature_2m, created_at, precipitation, timestamp')
        .eq('location', location)
        .order('timestamp', { ascending: true })
        .limit(100); // Ordenar por timestamp ascendente

  if (error) throw error;

      // ✅ Nuevo código para modificar la fecha antes de devolver los datos
      const modifiedData = data.map(item => {
        const date = new Date(item.created_at);
        date.setHours(date.getHours() + 2); // Agrega 2 horas
        return {
          ...item,
          created_at: date.toISOString() // Guarda la fecha como un string ISO para consistencia
        };
      });

      console.log('Data fetched and modified:', modifiedData);
      return modifiedData || [];
    } catch (error) {
      console.error('Supabase error:', error);
      return [];
    }
  }

  // ✅ Función modificada para obtener el pronóstico del bloque más reciente
  // async getDataByLocationForecast(location: string): Promise<any[]> {
  //   try {
  //     console.log('Fetching forecast data for location:', location);

  //     // Obtener la fecha y hora actuales
  //     const today = new Date();

  //     // Establecer el inicio del rango (medianoche del día actual)
  //     const startDate = new Date(today);
  //     startDate.setHours(0, 0, 0, 0); // Establecer la hora a 00:00:00

  //     // Establecer el fin del rango (fin del segundo día)
  //     const endDate = new Date(today);
  //     endDate.setDate(endDate.getDate() + 2); // Añadir 2 días
  //     endDate.setHours(23, 59, 59, 999); // Fin del segundo día

  //     // Obtener el created_at más reciente para la ubicación
  //     const { data: latestCreatedAtData, error: latestError } = await this.supabase
  //       .from('forecast_data')
  //       .select('created_at')
  //       .eq('location', location)
  //       .order('created_at', { ascending: false })
  //       .limit(1);

  //     if (latestError) throw latestError;
  //     if (!latestCreatedAtData || latestCreatedAtData.length === 0) {
  //       console.log('No forecast data found for location:', location);
  //       return [];
  //     }

  //     const latestCreatedAt = latestCreatedAtData[0].created_at;

  //     // Realizar la consulta para obtener los registros del bloque más reciente
  //     const { data, error } = await this.supabase
  //       .from('forecast_data')
  //       .select('timestamp, location, temperature_2m, precipitation, created_at')
  //       .eq('location', location)
  //       .eq('created_at', latestCreatedAt)
  //       .gte('timestamp', startDate.toISOString()) // Mayor o igual que la fecha de inicio
  //       .lte('timestamp', endDate.toISOString()) // Menor o igual que la fecha de fin
  //       .order('timestamp', { ascending: true }); // Ordenar por timestamp ascendente

  //     if (error) throw error;

  //     console.log('Forecast data fetched:', data);
  //     return data || [];
  //   } catch (error) {
  //     console.error('Supabase error:', error);
  //     return [];
  //   }
  // }


  // // ✅ Nueva función para obtener el pronóstico de 2 días
  // async getDataByLocationForecast(location: string): Promise<any[]> {
  //   try {
  //     console.log('Fetching forecast data for location:', location);

  //     // Obtener la fecha y hora actuales
  //     const today = new Date();

  //     // Establecer el inicio del rango (medianoche del día actual)
  //     const startDate = new Date(today);
  //     startDate.setHours(0, 0, 0, 0); // Establecer la hora a 00:00:00

  //     // Establecer el fin del rango (fin del segundo día)
  //     const endDate = new Date(today);
  //     endDate.setDate(endDate.getDate() + 2); // Añadir 2 días

  //     // Realizar la consulta a la tabla forecast_data
  //     const { data, error } = await this.supabase
  //       .from('forecast_data')
  //       .select('timestamp, location, temperature_2m, precipitation')
  //       .eq('location', location)
  //       .gte('timestamp', startDate.toISOString()) // Mayor o igual que la fecha de inicio
  //       .lt('timestamp', endDate.toISOString()) // Menor que la fecha de fin (para incluir todo el segundo día)
  //       .order('timestamp', { ascending: true }); // Ordenar de forma ascendente

  //     if (error) throw error;

  //     console.log('Forecast data fetched:', data);
  //     return data || [];
  //   } catch (error) {
  //     console.error('Supabase error:', error);
  //     return [];
  //   }
  // }

  // async getDataByLocation(location: string): Promise<any[]> {
  //   try {
  //     console.log('Fetching data for location:', location); // Depuración
  //     const { data, error } = await this.supabase
  //       .from('current_data')
  //       .select('location, temperature_2m, created_at')
  //       .eq('location', location)
  //       .order('created_at', { ascending: false })
  //       .limit(1);

  //     if (error) throw error;
  //     console.log('Data fetched:', data); // Depuración
  //     return data || [];
  //   } catch (error) {
  //     console.error('Supabase error:', error);
  //     return [];
  //   }
  // }
}
