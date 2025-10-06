import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilService } from 'src/app/services/util.service';
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

SwiperCore.use([Navigation, Pagination]);

// Constants for weather thresholds (adjustable)
const TEMPERATURE_COLD_THRESHOLD = 10; // °C
const APPARENT_TEMPERATURE_COLD_THRESHOLD = 10; // °C
const PRECIPITATION_PROBABILITY_THRESHOLD = 60; // %
const WIND_SPEED_THRESHOLD = 30; // km/h
const TEMPERATURE_VERY_COLD_THRESHOLD = 0; // °C
const HUMIDITY_FOG_THRESHOLD = 80; // %
const VISIBILITY_FOG_THRESHOLD = 1000; // metros
const TEMPERATURE_HOT_THRESHOLD = 25; // °C
const CLOUDCOVER_CLEAR_THRESHOLD = 50; // %
const WIND_SPEED_CALM_THRESHOLD = 10; // km/h

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiper?: ElementRef<HTMLElement>;
  activeIndex: number = 0;
  loader: boolean = false;
  weatherData: any[] = [];
  private swiperInstance?: SwiperCore;

  constructor(
    public util: UtilService,
    private supabase: SupabaseService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.loader = true;
      this.loadWeatherData();
    }, 1000);
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit called, waiting for loader');
  }

  initializeSwiper() {
    if (this.swiper?.nativeElement && this.loader) {
      this.swiperInstance = new SwiperCore(this.swiper.nativeElement, {
        slidesPerView: 1,
        spaceBetween: 0,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          type: 'bullets',
        },
        observeParents: true,
        observer: true,
        speed: 400,
        touchRatio: 1,
        simulateTouch: true,
        allowTouchMove: true,
      });
      console.log('Swiper initialized:', this.swiperInstance);
      this.swiperInstance.on('slideChange', () => {
        this.activeIndex = this.swiperInstance!.activeIndex;
        console.log('Swiper slide changed, activeIndex:', this.activeIndex);
      });
      this.swiperInstance.update();
      console.log('Swiper updated in initializeSwiper');
    } else {
      console.error('Swiper element or loader not ready:', { swiper: !!this.swiper, loader: this.loader });
    }
  }

 async loadWeatherData() {
    const locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
    try {
      this.loader = false;
      this.weatherData = await Promise.all(
        locations.map(async location => {
          const data = await this.supabase.getDataByLocation(location);
          const item = data[0] || {};
          console.log('Supabase data for', location, ':', item);
          const createdAt = item.created_at ? new Date(item.created_at) : null;
          if (createdAt instanceof Date && createdAt.toString() !== 'Invalid Date') {
            createdAt.setHours(createdAt.getHours() + 2); // Ajuste CEST
          }
          const timestamp = item.timestamp ? new Date(item.timestamp) : null;
          if (timestamp instanceof Date && timestamp.toString() !== 'Invalid Date') {
            timestamp.setHours(timestamp.getHours() + 2); // Ajuste CEST
          }
          const weatherResult = this.mapWeatherToBackgroundAccesories(item);
          const result = {
            location: String(item.location || location || 'N/A'),
            temp: item.temperature_2m != null ? Number(item.temperature_2m).toFixed(1) : 'N/A',
            rain: item.precipitation != null ? Number(item.precipitation).toFixed(1) : '0.0',
            date: createdAt, // Pasar el Date original, no formateado
            time: timestamp instanceof Date && timestamp.toString() !== 'Invalid Date'
              ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'N/A',
            background: weatherResult.background,
            accessories: weatherResult.accessories,
            apparentTemp: item.apparent_temperature != null ? Number(item.apparent_temperature).toFixed(1) : 'N/A',
            precipitation: item.precipitation != null ? Number(item.precipitation).toFixed(1) : 'N/A', // Añadido
            windSpeed: item.wind_speed_10m != null ? Number(item.wind_speed_10m).toFixed(1) : 'N/A' // Añadido
          };
          console.log('Processed item for', location, ':', result);
          console.log('Background URL:', `/assets/backgrounds/${result.background}`);
          return result;
        })
      );
      if (this.weatherData.length === 0) {
        console.log('No weather data loaded, using fallback');
        this.weatherData = locations.map(location => ({
          location: String(location),
          temp: 'N/A',
          rain: '0.0',
          date: null, // Fallback con null
          time: 'N/A',
          background: 'soleado.png',
          accessories: [],
          apparentTemp: 'N/A',
          precipitation: 'N/A', // Fallback
          windSpeed: 'N/A' // Fallback
        }));
      }
      this.loader = true;
      this.cdr.detectChanges(); // Forzar detección de cambios
      setTimeout(() => {
        this.initializeSwiper();
      }, 1000); // Asegurar DOM listo
    } catch (error) {
      console.error('Error loading weather data:', error);
      this.loader = true;
      this.weatherData = locations.map(location => ({
        location: String(location),
        temp: 'N/A',
        rain: '0.0',
        date: null, // Fallback con null
        time: 'N/A',
        background: 'soleado.png',
        accessories: [],
        apparentTemp: 'N/A',
          precipitation: 'N/A', // Fallback
          windSpeed: 'N/A' // Fallback
      }));
      this.cdr.detectChanges();
      setTimeout(() => {
        this.initializeSwiper();
      }, 1000);
    }
  }

mapWeatherToBackgroundAccesories(item: any): { background: string, accessories: string[], isDay: number } {
    const weatherCode = Number(item.weathercode ?? -1);
    const isDay = Number(item.is_day ?? 1);
    const cloudcover = Number(item.cloudcover ?? 0);
    const temperature = Number(item.temperature_2m ?? 0);
    const precipitation = Number(item.precipitation ?? 0);
    const windSpeed = Number(item.wind_speed_10m ?? 0);
    const visibility = Number(item.visibility ?? 100000); // en metros
    const precipitationProbability = Number(item.precipitation_probability ?? 0);
    const relativeHumidity = Number(item.relative_humidity_2m ?? 0);
    const apparentTemperature = Number(item.apparent_temperature ?? 0);

    // Definir constantes dentro de la función (ajustar según tu proyecto)
    const WIND_SPEED_THRESHOLD = 15; // Umbral para viento fuerte (m/s)
    const TEMPERATURE_COLD_THRESHOLD = 10; // Ejemplo, ajusta si tienes un valor
    const APPARENT_TEMPERATURE_COLD_THRESHOLD = 5; // Ejemplo, ajusta si tienes un valor
    const TEMPERATURE_VERY_COLD_THRESHOLD = 0; // Ejemplo, ajusta si tienes un valor
    const VISIBILITY_FOG_THRESHOLD = 1000; // Ejemplo, ajusta si tienes un valor
    const HUMIDITY_FOG_THRESHOLD = 90; // Ejemplo, ajusta si tienes un valor
    const TEMPERATURE_HOT_THRESHOLD = 25; // Ejemplo, ajusta si tienes un valor
    const CLOUDCOVER_CLEAR_THRESHOLD = 20; // Ejemplo, ajusta si tienes un valor
    const WIND_SPEED_CALM_THRESHOLD = 5; // Ejemplo, ajusta si tienes un valor

    let background = 'eliminar.png'; // Fallback
    const accessories: string[] = [];

    // Noche con viento fuerte y sin lluvia (prioridad alta)
    if (windSpeed > WIND_SPEED_THRESHOLD && isDay === 0 && precipitation === 0) {
      background = 'vientofuerte_noche.png';
      accessories.push('cortaviento');
      if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
        accessories.push('bufanda');
      }
      if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) {
        accessories.push('abrigo-polar');
      }
    }
    // Viento fuerte (día o con lluvia)
    else if (windSpeed > WIND_SPEED_THRESHOLD) {
      background = 'vientofuerte.png';
      accessories.push('cortaviento');
      if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
        accessories.push('bufanda');
      }
      if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) {
        accessories.push('abrigo-polar');
      }
    }
    // Noche despejada
    else if (weatherCode === 0 && isDay === 0) {
      background = 'nochedespejada.png';
    }
    // Noche nublada
    else if ((weatherCode === 3 || weatherCode >= 61) && isDay === 0) {
      background = 'nublado_cloudy.png';
      accessories.push('bufanda');
    }
    // Despejado (día)
    else if (weatherCode === 0 && isDay === 1) {
      background = 'despejado_clear.png';
    }
    // Soleado
    else if ((weatherCode === 1 || weatherCode === 2) && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
      background = 'soleado_sunny.png';
      accessories.push('gafas', 'gorra');
    }
    // Parcialmente nublado
    else if (weatherCode === 2 && cloudcover >= CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
      background = 'parcialmentenublado.png';
    }
    // Nublado (día)
    else if (weatherCode === 3 && isDay === 1) {
      background = 'nublado_cloudy.png';
      accessories.push('bufanda');
    }
    // Tormenta
    else if ([95, 96, 99].includes(weatherCode)) {
      background = 'tormenta_thunder.png';
      accessories.push('paraguas', 'impermeable');
    }
    // Lluvia
    else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      background = 'lluvia_rain.png';
      accessories.push('paraguas', 'impermeable');
      if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
        accessories.push('abrigo-polar');
      }
    }
    // Llovizna
    else if ([51, 53, 55].includes(weatherCode)) {
      background = 'llovisnaDrizzle.png';
      accessories.push('paraguas');
    }
    // Nieve
    else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      background = 'helada_escarcha.png';
      accessories.push('abrigo-polar', 'botas');
    }
    // Escarcha sin precipitación
    else if (temperature <= TEMPERATURE_VERY_COLD_THRESHOLD && precipitation === 0 && [0, 1, 2, 3].includes(weatherCode)) {
      background = 'helada_escarcha2.png';
      accessories.push('bufanda', 'guantes');
    }
    // Niebla
    else if ([45, 48].includes(weatherCode) || visibility < VISIBILITY_FOG_THRESHOLD || relativeHumidity > HUMIDITY_FOG_THRESHOLD) {
      background = 'nieblafog.png';
      accessories.push('bufanda');
    }
    // Bruma / Calima
    else if ([0, 1, 2].includes(weatherCode) && temperature > TEMPERATURE_HOT_THRESHOLD && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && windSpeed < WIND_SPEED_CALM_THRESHOLD) {
      background = 'bruma_calima.png';
    }

    // Remove duplicates
    return {
      background: background,
      accessories: [...new Set(accessories)].filter(acc => acc),
      isDay: isDay // Añadido para controlar el color de los iconos
    };
  }



  // mapWeatherToBackgroundAccesories(item: any): { background: string, accessories: string[] } {
  //   const weatherCode = Number(item.weathercode ?? -1);
  //   const isDay = Number(item.is_day ?? 1);
  //   const cloudcover = Number(item.cloudcover ?? 0);
  //   const temperature = Number(item.temperature_2m ?? 0);
  //   const precipitation = Number(item.precipitation ?? 0);
  //   const windSpeed = Number(item.wind_speed_10m ?? 0);
  //   const visibility = Number(item.visibility ?? 100000); // en metros
  //   const precipitationProbability = Number(item.precipitation_probability ?? 0);
  //   const relativeHumidity = Number(item.relative_humidity_2m ?? 0);
  //   const apparentTemperature = Number(item.apparent_temperature ?? 0);

  //   // Definir constantes dentro de la función (ajustar según tu proyecto)
  //   const WIND_SPEED_THRESHOLD = 15; // Umbral para viento fuerte (m/s)
  //   const TEMPERATURE_COLD_THRESHOLD = 10; // Ejemplo, ajusta si tienes un valor
  //   const APPARENT_TEMPERATURE_COLD_THRESHOLD = 5; // Ejemplo, ajusta si tienes un valor
  //   const TEMPERATURE_VERY_COLD_THRESHOLD = 0; // Ejemplo, ajusta si tienes un valor
  //   const VISIBILITY_FOG_THRESHOLD = 1000; // Ejemplo, ajusta si tienes un valor
  //   const HUMIDITY_FOG_THRESHOLD = 90; // Ejemplo, ajusta si tienes un valor
  //   const TEMPERATURE_HOT_THRESHOLD = 25; // Ejemplo, ajusta si tienes un valor
  //   const CLOUDCOVER_CLEAR_THRESHOLD = 20; // Ejemplo, ajusta si tienes un valor
  //   const WIND_SPEED_CALM_THRESHOLD = 5; // Ejemplo, ajusta si tienes un valor

  //   let background = 'eliminar.png'; // Fallback
  //   const accessories: string[] = [];

  //   // Noche con viento fuerte y sin lluvia (prioridad alta)
  //   if (windSpeed > WIND_SPEED_THRESHOLD && isDay === 0 && precipitation === 0) {
  //     background = 'vientofuerte_noche.png';
  //     accessories.push('cortaviento');
  //     if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
  //       accessories.push('bufanda');
  //     }
  //     if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) {
  //       accessories.push('abrigo-polar');
  //     }
  //   }
  //   // Viento fuerte (día o con lluvia)
  //   else if (windSpeed > WIND_SPEED_THRESHOLD) {
  //     background = 'vientofuerte.png';
  //     accessories.push('cortaviento');
  //     if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
  //       accessories.push('bufanda');
  //     }
  //     if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) {
  //       accessories.push('abrigo-polar');
  //     }
  //   }
  //   // Noche despejada
  //   else if (weatherCode === 0 && isDay === 0) {
  //     background = 'nochedespejada.png';
  //   }
  //   // Noche nublada
  //   else if ((weatherCode === 3 || weatherCode >= 61) && isDay === 0) {
  //     background = 'nublado_cloudy.png';
  //     accessories.push('bufanda');
  //   }
  //   // Despejado (día)
  //   else if (weatherCode === 0 && isDay === 1) {
  //     background = 'despejado_clear.png';
  //   }
  //   // Soleado
  //   else if ((weatherCode === 1 || weatherCode === 2) && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
  //     background = 'soleado_sunny.png';
  //     accessories.push('gafas', 'gorra');
  //   }
  //   // Parcialmente nublado
  //   else if (weatherCode === 2 && cloudcover >= CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
  //     background = 'parcialmentenublado.png';
  //   }
  //   // Nublado (día)
  //   else if (weatherCode === 3 && isDay === 1) {
  //     background = 'nublado_cloudy.png';
  //     accessories.push('bufanda');
  //   }
  //   // Tormenta
  //   else if ([95, 96, 99].includes(weatherCode)) {
  //     background = 'tormenta_thunder.png';
  //     accessories.push('paraguas', 'impermeable');
  //   }
  //   // Lluvia
  //   else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
  //     background = 'lluvia_rain.png';
  //     accessories.push('paraguas', 'impermeable');
  //     if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
  //       accessories.push('abrigo-polar');
  //     }
  //   }
  //   // Llovizna
  //   else if ([51, 53, 55].includes(weatherCode)) {
  //     background = 'llovisnaDrizzle.png';
  //     accessories.push('paraguas');
  //   }
  //   // Nieve
  //   else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
  //     background = 'helada_escarcha.png';
  //     accessories.push('abrigo-polar', 'botas');
  //   }
  //   // Escarcha sin precipitación
  //   else if (temperature <= TEMPERATURE_VERY_COLD_THRESHOLD && precipitation === 0 && [0, 1, 2, 3].includes(weatherCode)) {
  //     background = 'helada_escarcha2.png';
  //     accessories.push('bufanda', 'guantes');
  //   }
  //   // Niebla
  //   else if ([45, 48].includes(weatherCode) || visibility < VISIBILITY_FOG_THRESHOLD || relativeHumidity > HUMIDITY_FOG_THRESHOLD) {
  //     background = 'nieblafog.png';
  //     accessories.push('bufanda');
  //   }
  //   // Bruma / Calima
  //   else if ([0, 1, 2].includes(weatherCode) && temperature > TEMPERATURE_HOT_THRESHOLD && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && windSpeed < WIND_SPEED_CALM_THRESHOLD) {
  //     background = 'bruma_calima.png';
  //   }

  //   // Remove duplicates
  //   return {
  //     background: background,
  //     accessories: [...new Set(accessories)].filter(acc => acc)
  //   };
  // }



  // En welcome.page.ts
getCustomDate(date: Date | null): string {
  if (!date || date.toString() === 'Invalid Date') {
    return 'Lunes, Ene 1'; // Fallback seguro
  }
  return date.toLocaleDateString('es-ES', {
    weekday: 'long', // Nombre completo del día (e.g., "Domingo")
    month: 'short',  // Tres iniciales del mes (e.g., "Sep")
    day: 'numeric'   // Día numérico (e.g., "28")
  }).replace(/^\w+/, match => match.charAt(0).toUpperCase() + match.slice(1)); // Capitaliza el día
}


  ngOnDestroy() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      console.log('Swiper instance destroyed');
    }
  }
}



  // async loadWeatherData() {
  //   const locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
  //   try {
  //     this.loader = false;
  //     this.weatherData = await Promise.all(
  //       locations.map(async location => {
  //         const data = await this.supabase.getDataByLocation(location);
  //         const item = data[0] || {};
  //         console.log('Supabase data for', location, ':', item);
  //         const createdAt = item.created_at ? new Date(item.created_at) : null;
  //         if (createdAt instanceof Date && createdAt.toString() !== 'Invalid Date') {
  //           createdAt.setHours(createdAt.getHours() + 2); // Sumar 2 horas para Madrid (CEST)
  //         }
  //         const timestamp = item.timestamp ? new Date(item.timestamp) : null;
  //         if (timestamp instanceof Date && timestamp.toString() !== 'Invalid Date') {
  //           timestamp.setHours(timestamp.getHours() + 2); // Sumar 2 horas para Madrid (CEST)
  //         }
  //         const result = {
  //           location: String(item.location || location || 'N/A'),
  //           temp: item.temperature_2m != null ? Number(item.temperature_2m).toFixed(1) : 'N/A',
  //           rain: item.precipitation != null ? Number(item.precipitation).toFixed(1) : '0.0',
  //           date: createdAt instanceof Date && createdAt.toString() !== 'Invalid Date' ? createdAt.toLocaleDateString() : 'N/A',
  //           time: timestamp instanceof Date && timestamp.toString() !== 'Invalid Date' ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
  //           background: this.mapWeatherToBackgroundAccesories(item).background
  //         };
  //         console.log('Processed item for', location, ':', result);
  //         console.log('Background URL:', `/assets/backgrounds/${result.background}`);
  //         return result;
  //       })
  //     );
  //     if (this.weatherData.length === 0) {
  //       console.warn('No weather data loaded, using fallback');
  //       this.weatherData = locations.map(location => ({
  //         location: String(location),
  //         temp: 'N/A',
  //         rain: '0.0',
  //         date: 'N/A',
  //         time: 'N/A',
  //         background: 'soleado.png'
  //       }));
  //     }
  //     this.loader = true;
  //     this.cdr.detectChanges(); // Forzar detección de cambios
  //     setTimeout(() => {
  //       this.initializeSwiper();
  //     }, 1000); // Aumentar timeout para asegurar que el DOM esté listo
  //   } catch (error) {
  //     console.error('Error loading weather data:', error);
  //     this.loader = true;
  //     this.weatherData = locations.map(location => ({
  //       location: String(location),
  //       temp: 'N/A',
  //       rain: '0.0',
  //       date: 'N/A',
  //       time: 'N/A',
  //       background: 'soleado.png'
  //     }));
  //     this.cdr.detectChanges();
  //     setTimeout(() => {
  //       this.initializeSwiper();
  //     }, 1000);
  //   }
  // }



  // mapWeatherToBackgroundAccesories(item: any): { background: string, accessories: string[] } {
  //   const weathercode = Number(item.weathercode ?? -1);
  //   const isDay = Number(item.is_day ?? 1);
  //   const cloudcover = Number(item.cloudcover ?? 0);
  //   const temperature = Number(item.temperature_2m ?? 0);
  //   const precipitation = Number(item.precipitation ?? 0);
  //   const windSpeed = Number(item.wind_speed_10m ?? 0);
  //   const visibility = Number(item.visibility ?? 100000); // en metros

  //   let background = 'eliminar.png'; // Fallback

  //   // Tormenta
  //   if ([95, 96, 99].includes(weathercode)) background = 'tormenta_thunder.png';

  //   // Lluvia
  //   if ([61, 63, 65, 80, 81, 82].includes(weathercode)) background = 'lluvia_rain.png';

  //   // Llovizna
  //   if ([51, 53, 55].includes(weathercode)) background = 'llovisnaDrizzle.png';

  //   // Nieve
  //   if ([71, 73, 75, 77, 85, 86].includes(weathercode)) background = 'helada_escarcha.png';

  //   // Escarcha sin precipitación
  //   if (temperature <= 0 && precipitation === 0 && [0, 1, 2, 3].includes(weathercode)) background = 'helada_escarcha2.png';

  //   // Niebla
  //   if ([45, 48].includes(weathercode) || visibility < 1000) background = 'nieblafog.png';

  //   // Bruma / Calima
  //   if ([0, 1, 2].includes(weathercode) && temperature > 25 && cloudcover < 30 && windSpeed < 10) background = 'bruma_calima.png';

  //   // Viento fuerte
  //   if (windSpeed > 30) background = 'vientofuerte.png';

  //   // Noche despejada
  //   if (weathercode === 0 && isDay === 0) background = 'nochedespejada.png';

  //   // Noche nublada
  //   if ((weathercode === 3 || weathercode >= 61) && isDay === 0) background = 'nublado_cloudy.png';

  //   // Despejado
  //   if (weathercode === 0 && isDay === 1) background = 'despejado_clear.png';

  //   // Soleado
  //   if ((weathercode === 1 || weathercode === 2) && cloudcover < 50 && isDay === 1) background = 'soleado_sunny.png';

  //   // Parcialmente nublado
  //   if (weathercode === 2 && cloudcover >= 50 && isDay === 1) background = 'parcialmentenublado.png';

  //   // Nublado uno
  //   if (weathercode === 3 && isDay === 1) background = 'nublado_cloudy.png';

  //   // Return with empty accessories for now
  //   return {
  //     background: background,
  //     accessories: []
  //   };
  // }
