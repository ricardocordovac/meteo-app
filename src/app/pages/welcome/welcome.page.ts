

import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilService } from 'src/app/services/util.service';
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { AnimationOptions } from 'ngx-lottie';
import mapAnimation from '../../../assets/lottie/map.json';

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

interface WeatherDisplay {
  location: string;
  temp: string;
  apparentTemp: string;
  precipitation: string;
  windSpeed: string;
  isDay?: number;
  date: string;
  time: string;
  background: string;
  description?: string;
  lottieOptions?: AnimationOptions;
}



@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiper?: ElementRef<HTMLElement>;

 // Variables para la interfaz
  isIos: boolean = false;
  isAndroid: boolean = false;
  loader: boolean = false;
// Modelo de datos unificado para inyección limpia en las directivas del DOM
  weatherData: any[] = [
    {
      location: 'Valdeolmos',
      date: new Date(),
      temp: 32.1,
      apparentTemp: 32.6,
      precipitation: 0,
      windSpeed: 8,
      background_image_url: 'assets/backgrounds/soleado.jpg',
      outfit_image_url: 'assets/characters/summer_anime.png'
    }
  ];
  activeIndex: number = 0;


  mapLottieOptions: AnimationOptions = {
    animationData: mapAnimation, // Esto evita el XMLHttpRequest
    loop: true,
    autoplay: true,
    renderer: 'svg' // Más estable en Safari
  };

  private swiperInstance?: SwiperCore;



  constructor(
    public util: UtilService,
    private supabase: SupabaseService,
      private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {
    // Detectar plataforma al inicio
    this.isIos = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');

  }

  ngOnInit() {
    setTimeout(() => {
      this.loader = true;
      this.loadWeatherData();
    }, 1200);
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
        const data = await this.supabase.getMeteoCondition(location); // Corrección de 'supabase' a 'supabaseService'
        const createdAt = data?.created_at ? new Date(data.created_at) : null;
        const lottiePath = this.getWeatherLottiePath(data?.background || 'sunny');
        return {
          location: data?.location || location || 'N/A',
          temp: data?.temp || 'N/A',
          apparentTemp: data?.apparentTemp || 'N/A',
          precipitation: data?.precipitation || 'N/A',
          windSpeed: data?.windSpeed || 'N/A',
          isDay: data?.isDay || 0,
          date: createdAt,
          time: createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A',
          background: data?.background || '/assets/backgrounds/soleado.jpg',
          background_image_url: data?.background_image_url || '/assets/backgrounds/soleado.jpg',
          outfit_image_url: data?.outfit_image_url ||  '/assets/backgrounds/prototipo.png',
          description: data?.description || 'N/A',
           lottieOptions: {
              path: `assets/lottie/${lottiePath}`,
            }
        };
      })
    );
    if (this.weatherData.length === 0) {
      this.weatherData = locations.map(location => ({
        location: String(location),
        temp: 'N/A',
        apparentTemp: 'N/A',
        precipitation: 'N/A',
        windSpeed: 'N/A',
        date: null,
        time: 'N/A',
        background: '/assets/backgrounds/soleado.jpg',
        background_image_url: '/assets/backgrounds/soleado.jpg',
        outfit_image_url:'/assets/backgrounds/prototipo.png',
        description: 'N/A'
      }));
    }
    this.loader = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.initializeSwiper();
    }, 1000);
  } catch (error) {
    console.error('Error loading weather data:', error);
    this.loader = true;
    this.weatherData = locations.map(location => ({
      location: String(location),
      temp: 'N/A',
      apparentTemp: 'N/A',
      precipitation: 'N/A',
      windSpeed: 'N/A',
      date: null,
      time: 'N/A',
      background: '/assets/backgrounds/soleado.jpg',
      background_image_url: '/assets/backgrounds/soleado.jpg',
      outfit_image_url:'/assets/backgrounds/prototipo.png',
      description: 'N/A'
    }));
    this.cdr.detectChanges();
    setTimeout(() => {
      this.initializeSwiper();
    }, 1000);
  }
}


 // --- HELPER PARA MAPEAR EL ARCHIVO JSON CORRECTO ---
  private getWeatherLottiePath(background: string): string {
    const bg = background.toLowerCase();
    if (bg.includes('sunny') || bg.includes('soleado')) return 'weather-sunny.json';
    if (bg.includes('cloudy') || bg.includes('nublado')) return 'weather-cloudy.json';
    if (bg.includes('rain') || bg.includes('lluvia')) return 'weather-rain.json';
    if (bg.includes('storm') || bg.includes('tormenta')) return 'weather-storm.json';
    if (bg.includes('night') || bg.includes('noche')) return 'weather-night.json';
    return 'weather-sunny.json'; // Fallback
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

    let background = 'eliminar.jpg'; // Fallback
    const accessories: string[] = [];

    // Noche con viento fuerte y sin lluvia (prioridad alta)
    if (windSpeed > WIND_SPEED_THRESHOLD && isDay === 0 && precipitation === 0) {
      background = 'vientofuerte_noche.jpg';
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
      background = 'vientofuerte.jpg';
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
      background = 'nochedespejada.jpg';
    }
    // Noche nublada
    else if ((weatherCode === 3 || weatherCode >= 61) && isDay === 0) {
      background = 'noche_nublada_luna.jpg';
      accessories.push('bufanda');
    }
    // Despejado (día)
    else if (weatherCode === 0 && isDay === 1) {
      background = 'despejado_clear.jpg';
    }
    // Soleado
    else if ((weatherCode === 1 || weatherCode === 2) && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
      background = 'soleado_sunny.jpg';
      accessories.push('gafas', 'gorra');
    }
    // Parcialmente nublado
    else if (weatherCode === 2 && cloudcover >= CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
      background = 'parcialmentenublado.jpg';
    }
    // Nublado (día)
    else if (weatherCode === 3 && isDay === 1) {
      background = 'nublado_cloudy.jpg';
      accessories.push('bufanda');
    }
    // Tormenta
    else if ([95, 96, 99].includes(weatherCode)) {
      background = 'tormenta_thunder.jpg';
      accessories.push('paraguas', 'impermeable');
    }
    // Lluvia
    else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
      background = 'lluvia_rain.jpg';
      accessories.push('paraguas', 'impermeable');
      if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) {
        accessories.push('abrigo-polar');
      }
    }
    // Llovizna
    else if ([51, 53, 55].includes(weatherCode)) {
      background = 'llovisnaDrizzle.jpg';
      accessories.push('paraguas');
    }
    // Nieve
    else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      background = 'helada_escarcha.jpg';
      accessories.push('abrigo-polar', 'botas');
    }
    // Escarcha sin precipitación
    else if (temperature <= TEMPERATURE_VERY_COLD_THRESHOLD && precipitation === 0 && [0, 1, 2, 3].includes(weatherCode)) {
      background = 'helada_escarcha2.jpg';
      accessories.push('bufanda', 'guantes');
    }
    // Niebla
    else if ([45, 48].includes(weatherCode) || visibility < VISIBILITY_FOG_THRESHOLD || relativeHumidity > HUMIDITY_FOG_THRESHOLD) {
      background = 'nieblafog.jpg';
      accessories.push('bufanda');
    }
    // Bruma / Calima
    else if ([0, 1, 2].includes(weatherCode) && temperature > TEMPERATURE_HOT_THRESHOLD && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && windSpeed < WIND_SPEED_CALM_THRESHOLD) {
      background = 'bruma_calima.jpg';
    }

    // Remove duplicates
    return {
      background: background,
      accessories: [...new Set(accessories)].filter(acc => acc),
      isDay: isDay // Añadido para controlar el color de los iconos
    };
  }




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

getDisplayLocation(internalLocation: string): string {
    if (!internalLocation) return 'N/A';

    const map: { [key: string]: string } = {
      'valdeolmos': 'Valdeolmos',
      'algete': 'Algete',
      'el_casar': 'El Casar',
      'fuente_el_saz': 'Fuente el Saz'
    };

    return map[internalLocation.toLowerCase()] || internalLocation;
  }

// Agrega este método dentro de la clase de tu componente principal
openLocationDetailModal() {
  console.log('Abriendo panel de detalle con mapa y selección de pueblos...');
  // Aquí dispararemos el ModalController o cambiaremos la bandera para pintar la Fase 2.
}

  ngOnDestroy() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      console.log('Swiper instance destroyed');
    }
  }
}
