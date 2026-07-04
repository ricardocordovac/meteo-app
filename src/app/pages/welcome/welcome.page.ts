

import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilService } from 'src/app/services/util.service';
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import { AnimationOptions } from 'ngx-lottie';
import mapAnimation from '../../../assets/lottie/map.json';

// Importación Estática de Animaciones (Evita bloqueos de red/CORS en iOS y Android)
import sunnyAnimation from '../../../assets/lottie/weather-sunny.json';
import nightAnimation from '../../../assets/lottie/weather-night.json';
import cloudyDayAnimation from '../../../assets/lottie/weather-partly-cloudy-day.json';
import cloudyNightAnimation from '../../../assets/lottie/weather-partly-cloudy-night.json';
import cloudyAnimation from '../../../assets/lottie/weather-cloudy.json';
import drizzleAnimation from '../../../assets/lottie/weather-drizzle.json';
import rainAnimation from '../../../assets/lottie/weather-rain.json';
import stormAnimation from '../../../assets/lottie/weather-storm.json';
import snowAnimation from '../../../assets/lottie/weather-snow.json';
import fogAnimation from '../../../assets/lottie/weather-fog.json';

// Indicadores (Smart Chips)
import tempIndicator from '../../../assets/lottie/indicator-temp.json';
import humidityIndicator from '../../../assets/lottie/indicator-humidity.json';
import windIndicator from '../../../assets/lottie/indicator-wind.json';
import uvIndicator from '../../../assets/lottie/indicator-uv.json';
import rainChanceIndicator from '../../../assets/lottie/indicator-rain-chance.json';
import earthIndicator from '../../../assets/lottie/indicator-earth.json';
import { WeatherData } from 'src/app/interfaces/weather-data.interface';


SwiperCore.use([Navigation, Pagination]);

// Estructura Estricta para cada hora del Carrusel
interface HourlyForecast {
  fecha_hora: string;
  hora: string;
  temp: number;
  sensacion: number;
  weathercode: number;
  pop: number;
  lluvia_mm: number;
  uv: number;
  viento_kmh: number;
  es_dia: number;
  lottieOptions?: AnimationOptions; // Inyectado dinámicamente en el Front
}




// Estructura Estricta para cada hora del Carrusel
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

// Estructura Maestra de la Ubicación acoplada a Supabase
interface WeatherLocationData {
  location: string;
  date: Date | null;
  time: string;
  temp: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  uvIndex: number;
  pressure: number;
  weathercode: number;
  isDay: number;
  background_image_url: string;
  outfit_image_url: string;
  text_clothing: string;
  accessories: string[];
  primaryLottieOptions: AnimationOptions;
  pronostico_meteo: HourlyForecast[]; // 🌟 Las 72 horas estructuradas aquí
}



@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit, AfterViewInit {
  @ViewChild('swiper', { static: false }) swiper?: ElementRef<HTMLElement>;



// Controladores globales de Interfaz
  loader: boolean = false;
  activeIndex: number = 0;
  isInfoCardExpanded: boolean = false;
  isLocationModalOpen: boolean = false;

  // Detección de plataforma móvil nativa
  isIos: boolean = false;
  isAndroid: boolean = false;

  // Listado estricto de municipios bajo cobertura meteorológica
  locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
  weatherData: WeatherLocationData[] = [];


  // weatherData: any[] = [
  //   {
  //     location: 'Valdeolmos',
  //     date: new Date(),
  //     temp: 32.1,
  //     apparentTemp: 32.6,
  //     precipitation: 0,
  //     windSpeed: 8,
  //     background_image_url: 'assets/backgrounds/soleado.jpg',
  //     outfit_image_url: 'assets/characters/summer_anime.png'
  //   }
  // ];


  mapLottieOptions: AnimationOptions = {animationData: mapAnimation,loop: true,autoplay: true,renderer: 'svg' };
  earthIndicatorOptions: AnimationOptions = { animationData: earthIndicator, loop: true, autoplay: true, renderer: 'svg' };

  private swiperInstance?: SwiperCore;

 // --- Grupo A: Condiciones Meteorológicas (Instancias estáticas) ---
  readonly sunnyLottie: AnimationOptions = { animationData: sunnyAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly nightLottie: AnimationOptions = { animationData: nightAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly cloudyDayLottie: AnimationOptions = { animationData: cloudyDayAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly cloudyNightLottie: AnimationOptions = { animationData: cloudyNightAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly cloudyLottie: AnimationOptions = { animationData: cloudyAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly drizzleLottie: AnimationOptions = { animationData: drizzleAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly rainLottie: AnimationOptions = { animationData: rainAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly stormLottie: AnimationOptions = { animationData: stormAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly snowLottie: AnimationOptions = { animationData: snowAnimation, loop: true, autoplay: true, renderer: 'svg' };
  readonly fogLottie: AnimationOptions = { animationData: fogAnimation, loop: true, autoplay: true, renderer: 'svg' };

 // --- Grupo B: Indicadores ---
  readonly tempIndicator: AnimationOptions = { animationData: tempIndicator, loop: true, autoplay: true, renderer: 'svg' };
  readonly humidityIndicator: AnimationOptions = { animationData: humidityIndicator, loop: true, autoplay: true, renderer: 'svg' };
  readonly windIndicator: AnimationOptions = { animationData: windIndicator, loop: true, autoplay: true, renderer: 'svg' };
  readonly uvIndicator: AnimationOptions = { animationData: uvIndicator, loop: true, autoplay: true, renderer: 'svg' };
  readonly rainChanceIndicator: AnimationOptions = { animationData: rainChanceIndicator, loop: true, autoplay: true, renderer: 'svg' };
  readonly earthIndicator: AnimationOptions = { animationData: earthIndicator, loop: true, autoplay: true, renderer: 'svg' };

  constructor(
    public util: UtilService,
    private supabaseService: SupabaseService,
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
    console.log('WelcomePage cargado en el DOM, esperando resolución de flujos.');
  }

  /**
   * Inicializador seguro de Swiper Core
   */
  initializeSwiper() {
    if (this.swiper?.nativeElement && this.loader) {
      this.swiperInstance = new SwiperCore(this.swiper.nativeElement, {
        slidesPerView: 1,
        spaceBetween: 0,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        pagination: { el: '.swiper-pagination', clickable: true, type: 'bullets' },
        observeParents: true,
        observer: true,
        speed: 400,
        allowTouchMove: true,
      });

      this.swiperInstance.on('slideChange', () => {
        this.activeIndex = this.swiperInstance!.activeIndex;
        this.cdr.detectChanges();
      });
      this.swiperInstance.update();
    }
  }

async loadWeatherData() {
  try {
    this.loader = false;
    this.cdr.detectChanges();

    const promises = this.locations.map(async (town) => {
      // Consulta directa a la tabla current_data en Supabase
      const res: WeatherData[] | null = await this.supabaseService.getDataByLocation(town);

      // --- TRACE LOG: Municipio ausente en Supabase ---
      if (!res || res.length === 0) {
        console.warn(
          `⚠️ [MeteoApp Datacheck] El municipio '${town}' no devolvió ningún registro desde Supabase. Se utilizarán datos ficticios (Fallback global).`
        );
        return null;
      }

      const row: WeatherData = res[0];

      // 1. Deserialización segura del pronóstico por horas (JSONB)
      let horasArray: HourlyForecast[] = [];
      if (row.pronostico_meteo) {
        try {
          const parsed = typeof row.pronostico_meteo === 'string'
            ? JSON.parse(row.pronostico_meteo)
            : row.pronostico_meteo;

          horasArray = parsed.map((hora: any) => ({
            ...hora,
            lottieOptions: this.getLottiePropByCode(hora.weathercode, hora.es_dia)
          }));
        } catch (e) {
          console.error(`❌ Error parseando 'pronostico_meteo' (JSONB) para ${town}:`, e);
        }
      }

      // 2. Ejecutar motor de reglas local para obtener accesorios y fondos salvavidas
      const UIStyles = this.mapWeatherToBackgroundAccessories(row);

      // 3. RESOLUCIÓN Y LOGS DE FONDOS (INTERACCIÓN CON SUPABASE)
      let finalBg = '';

      if (row.background_image_url && row.background_image_url.trim() !== '') {
        // Si Supabase devuelve una ruta, la usamos.
        finalBg = row.background_image_url;

        // Alerta en consola si detectamos el String obsoleto/erroneo 'soelado' en el registro
        if (finalBg.includes('soleado')) {
          console.warn(
            `🚨 [MeteoApp Supabase Mismatch] Se detectó el archivo obsoleto 'soelado' en la base de datos para '${town}'. Corrigiendo a 'soleado.jpg' en caliente.`
          );
          finalBg = 'assets/backgrounds/soleado.jpg';
        }
      } else {
        // --- LOG SOLICITADO: Imagen no encontrada en Supabase ---
        console.warn(
          `ℹ️ [MeteoApp Fallback] Supabase NO devolvió 'background_image_url' (campo vacío/nulo) para '${town}'. Activando imagen de contingencia local: '${UIStyles.background}'`
        );
        finalBg = `assets/backgrounds/${UIStyles.background}`;
      }

      // 4. RESOLUCIÓN Y LOGS DE OUTFITS (PERSONAJES)
      let finalOutfit = '';
      if (row.outfit_image_url && row.outfit_image_url.trim() !== '') {
        finalOutfit = row.outfit_image_url;
      } else {
        console.warn(
          `ℹ️ [MeteoApp Fallback] Supabase NO devolvió 'outfit_image_url' para '${town}'. Colocando personaje por defecto.`
        );
        finalOutfit = 'assets/characters/summer_anime.png';
      }

      return {
        location: row.location || town,
        date: row.created_at ? new Date(row.created_at) : new Date(),
        time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        temp: row.temperature_2m ?? 0,
        apparentTemp: row.apparent_temperature ?? row.temperature_2m ?? 0,
        humidity: row.relative_humidity_2m ?? 0,
        precipitation: row.precipitation ?? 0,
        windSpeed: row.wind_speed_10m ?? 0,
        uvIndex: row.uv_index ?? 0,
        pressure: row.pressure_msl ?? 1013,
        weathercode: row.weathercode ?? 0,
        isDay: row.is_day ?? 1,
        background_image_url: finalBg, // Ruta limpia y validada lista para el HTML
        outfit_image_url: finalOutfit,
        text_clothing: row.text_clothing || 'Ropa recomendada',
        accessories: UIStyles.accessories,
        primaryLottieOptions: this.getLottiePropByCode(row.weathercode ?? 0, row.is_day ?? 1),
        pronostico_meteo: horasArray
      } as WeatherLocationData;
    });

    const results = await Promise.all(promises);
    // Filtrar municipios que no arrojaron datos ni fallbacks
    this.weatherData = results.filter((item): item is WeatherLocationData => item !== null);

    if (this.weatherData.length === 0) {
      console.error('🛑 [MeteoApp Crítico] Ningún municipio tiene datos en Supabase. Levantando datos simulados de emergencia.');
      this.generateFallbackData();
    }

    this.loader = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.initializeSwiper();
    }, 300);

  } catch (error) {
    console.error('❌ Error crítico no controlado en la carga general de loadWeatherData:', error);
    this.generateFallbackData();
    this.loader = true;
    this.cdr.detectChanges();
  }
}

mapWeatherToBackgroundAccessories(item: WeatherData): { background: string, accessories: string[] } {
  const weatherCode = Number(item.weathercode ?? -1);
  const isDay = Number(item.is_day ?? 1);
  const cloudcover = Number(item.cloudcover ?? 0);
  const temperature = Number(item.temperature_2m ?? 0);
  const precipitation = Number(item.precipitation ?? 0);
  const windSpeed = Number(item.wind_speed_10m ?? 0);
  const visibility = Number(item.visibility ?? 100000);
  const relativeHumidity = Number(item.relative_humidity_2m ?? 0);
  const apparentTemperature = Number(item.apparent_temperature ?? 0);

  // Constantes de Umbral
  const WIND_SPEED_THRESHOLD = 15;
  const TEMPERATURE_COLD_THRESHOLD = 10;
  const APPARENT_TEMPERATURE_COLD_THRESHOLD = 5;
  const TEMPERATURE_VERY_COLD_THRESHOLD = 0;
  const VISIBILITY_FOG_THRESHOLD = 1000;
  const HUMIDITY_FOG_THRESHOLD = 90;
  const TEMPERATURE_HOT_THRESHOLD = 25;
  const CLOUDCOVER_CLEAR_THRESHOLD = 20;
  const WIND_SPEED_CALM_THRESHOLD = 5;

  let background = 'soleado.jpg'; // Cambiado de 'soelado.jpg' a archivo real físico verificado
  const accessories: string[] = [];

  // --- REGLAS DE NEGOCIO METEOROLÓGICO ---
  if (windSpeed > WIND_SPEED_THRESHOLD && isDay === 0 && precipitation === 0) {
    background = 'vientofuerte_noche.jpg';
    accessories.push('cortaviento');
    if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) accessories.push('bufanda');
    if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) accessories.push('abrigo-polar');
  }
  else if (windSpeed > WIND_SPEED_THRESHOLD) {
    background = 'vientofuerte.jpg';
    accessories.push('cortaviento');
    if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) accessories.push('bufanda');
    if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) accessories.push('abrigo-polar');
  }
  else if (weatherCode === 0 && isDay === 0) {
    background = 'nochedespejada.jpg';
  }
  else if ((weatherCode === 3 || weatherCode >= 61) && isDay === 0) {
    background = 'noche_nublada_luna.jpg';
    accessories.push('bufanda');
  }
  else if (weatherCode === 0 && isDay === 1) {
    background = 'despejado_clear.jpg';
  }
  else if ((weatherCode === 1 || weatherCode === 2) && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
    background = 'soleado.jpg'; // Rescates locales seguros
    accessories.push('gafas', 'gorra');
  }
  else if (weatherCode === 2 && cloudcover >= CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
    background = 'parcialmentenublado.jpg';
  }
  else if (weatherCode === 3 && isDay === 1) {
    background = 'nublado_cloudy.jpg';
    accessories.push('bufanda');
  }
  else if ([95, 96, 99].includes(weatherCode)) {
    background = 'tormenta_thunder.jpg';
    accessories.push('paraguas', 'impermeable');
  }
  else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
    background = 'lluvia_rain.jpg';
    accessories.push('paraguas', 'impermeable');
    if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) accessories.push('abrigo-polar');
  }
  else if ([51, 53, 55].includes(weatherCode)) {
    background = 'llovisnaDrizzle.jpg';
    accessories.push('paraguas');
  }
  else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    background = 'helada_escarcha.jpg';
    accessories.push('abrigo-polar', 'botas');
  }
  else if (temperature <= TEMPERATURE_VERY_COLD_THRESHOLD && precipitation === 0 && [0, 1, 2, 3].includes(weatherCode)) {
    background = 'helada_escarcha2.jpg';
    accessories.push('bufanda', 'guantes');
  }
  else if ([45, 48].includes(weatherCode) || visibility < VISIBILITY_FOG_THRESHOLD || relativeHumidity > HUMIDITY_FOG_THRESHOLD) {
    background = 'nieblafog.jpg';
    accessories.push('bufanda');
  }
  else if ([0, 1, 2].includes(weatherCode) && temperature > TEMPERATURE_HOT_THRESHOLD && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && windSpeed < WIND_SPEED_CALM_THRESHOLD) {
    background = 'bruma_calima.jpg';
  }

  return {
    background: background,
    accessories: [...new Set(accessories)].filter(acc => acc)
  };
}

// async loadWeatherData() {
//   try {
//     this.loader = false;
//     this.cdr.detectChanges();

//     const promises = this.locations.map(async (town) => {
//       // Consulta directa a la tabla current_data
//       const res: WeatherData[] | null = await this.supabaseService.getDataByLocation(town);

//       if (res && res.length > 0) {
//         const row: WeatherData = res[0];

//         // 1. Deserialización segura del pronóstico por horas (JSONB)
//         let horasArray: HourlyForecast[] = [];
//         if (row.pronostico_meteo) {
//           try {
//             const parsed = typeof row.pronostico_meteo === 'string'
//               ? JSON.parse(row.pronostico_meteo)
//               : row.pronostico_meteo;

//             horasArray = parsed.map((hora: any) => ({
//               ...hora,
//               lottieOptions: this.getLottiePropByCode(hora.weathercode, hora.es_dia)
//             }));
//           } catch (e) {
//             console.error(`Error parseando pronostico_meteo para ${town}:`, e);
//           }
//         }

//         // 2. Fallback de estilos visuales si la base de datos no tiene la imagen calculada
//         const UIStyles = this.mapWeatherToBackgroundAccessories(row);

//         // 3. Resolución limpia de URLs de Fondos y Personajes
//         let finalBg = 'assets/backgrounds/soleado.jpg';
//         if (row.background_image_url) {
//           // Si es una ruta relativa/absoluta limpia, la usamos directamente
//           finalBg = row.background_image_url;
//         } else {
//           finalBg = `assets/backgrounds/${UIStyles.background}`;
//         }

//         let finalOutfit = 'assets/characters/summer_anime.png';
//         if (row.outfit_image_url) {
//           finalOutfit = row.outfit_image_url;
//         }

//         return {
//           location: row.location || town,
//           date: row.created_at ? new Date(row.created_at) : new Date(),
//           time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
//           temp: row.temperature_2m ?? 0,
//           apparentTemp: row.apparent_temperature ?? row.temperature_2m ?? 0,
//           humidity: row.relative_humidity_2m ?? 0,
//           precipitation: row.precipitation ?? 0,
//           windSpeed: row.wind_speed_10m ?? 0,
//           uvIndex: row.uv_index ?? 0,
//           pressure: row.pressure_msl ?? 1013,
//           weathercode: row.weathercode ?? 0,
//           isDay: row.is_day ?? 1,
//           background_image_url: finalBg,
//           outfit_image_url: finalOutfit,
//           text_clothing: row.text_clothing || 'Ropa recomendada',
//           accessories: UIStyles.accessories,
//           primaryLottieOptions: this.getLottiePropByCode(row.weathercode ?? 0, row.is_day ?? 1),
//           pronostico_meteo: horasArray
//         } as WeatherLocationData;
//       }
//       return null;
//     });

//     const results = await Promise.all(promises);
//     this.weatherData = results.filter((item): item is WeatherLocationData => item !== null);

//     if (this.weatherData.length === 0) {
//       this.generateFallbackData();
//     }

//     this.loader = true;
//     this.cdr.detectChanges();

//     setTimeout(() => {
//       this.initializeSwiper();
//     }, 300);

//   } catch (error) {
//     console.error('❌ Error crítico en la carga de datos:', error);
//     this.generateFallbackData();
//     this.loader = true;
//     this.cdr.detectChanges();
//   }
// }


  // initializeSwiper() {
  //   if (this.swiper?.nativeElement && this.loader) {
  //     this.swiperInstance = new SwiperCore(this.swiper.nativeElement, {
  //       slidesPerView: 1,
  //       spaceBetween: 0,
  //       navigation: {
  //         nextEl: '.swiper-button-next',
  //         prevEl: '.swiper-button-prev',
  //       },
  //       pagination: {
  //         el: '.swiper-pagination',
  //         clickable: true,
  //         type: 'bullets',
  //       },
  //       observeParents: true,
  //       observer: true,
  //       speed: 400,
  //       touchRatio: 1,
  //       simulateTouch: true,
  //       allowTouchMove: true,
  //     });
  //     console.log('Swiper initialized:', this.swiperInstance);
  //     this.swiperInstance.on('slideChange', () => {
  //       this.activeIndex = this.swiperInstance!.activeIndex;
  //       console.log('Swiper slide changed, activeIndex:', this.activeIndex);
  //     });
  //     this.swiperInstance.update();
  //     console.log('Swiper updated in initializeSwiper');
  //   } else {
  //     console.error('Swiper element or loader not ready:', { swiper: !!this.swiper, loader: this.loader });
  //   }
  // }

/**
   * FLUJO ÚNICO: Descarga, mapea y unifica los datos de Supabase en paralelo
   */
  // async loadWeatherData() {
  //   try {
  //     this.loader = false;
  //     this.cdr.detectChanges();

  //     // 1. Ejecución paralela de consultas por municipio
  //     const promises = this.locations.map(async (town) => {
  //       const res: WeatherData[] | null = await this.supabaseService.getDataByLocation(town);

  //       if (res && res.length > 0) {
  //         const row: WeatherData = res[0];

  //         // 2. Deserialización segura del JSONB de pronóstico (si existe)
  //         let horasArray: HourlyForecast[] = [];
  //         if (row.pronostico_meteo) {
  //           try {
  //             const parsed = typeof row.pronostico_meteo === 'string'
  //               ? JSON.parse(row.pronostico_meteo)
  //               : row.pronostico_meteo;

  //             // Mapeo de horas inyectando las propiedades Lottie estáticas ya declaradas
  //             horasArray = parsed.map((hora: any) => ({
  //               ...hora,
  //               lottieOptions: this.getLottiePropByCode(hora.weathercode, hora.es_dia)
  //             }));
  //           } catch (e) {
  //             console.error(`Error parseando pronostico_meteo para ${town}:`, e);
  //           }
  //         }

  //         // 3. Cálculo de accesorios y fondo basados en reglas
  //         const UIStyles = this.mapWeatherToBackgroundAccessories(row);

  //         // 4. Retorno del objeto tipado para la UI
  //         return {
  //           location: row.location || town,
  //           date: row.created_at ? new Date(row.created_at) : new Date(),
  //           time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
  //           temp: row.temperature_2m ?? 0,
  //           apparentTemp: row.apparent_temperature ?? row.temperature_2m ?? 0,
  //           humidity: row.relative_humidity_2m ?? 0,
  //           precipitation: row.precipitation ?? 0,
  //           windSpeed: row.wind_speed_10m ?? 0,
  //           uvIndex: row.uv_index ?? 0,
  //           pressure: row.pressure_msl ?? 1013,
  //           weathercode: row.weathercode ?? 0,
  //           isDay: row.is_day ?? 1,
  //           background_image_url: (row.background_image_url && !row.background_image_url.includes('OUTFIT'))
  //             ? (row.background_image_url.includes('soelado') ? 'assets/backgrounds/soleado.jpg' : row.background_image_url)
  //             : `assets/backgrounds/${UIStyles.background}`,
  //           outfit_image_url: (row.background_image_url && row.background_image_url.includes('OUTFIT'))
  //             ? `assets/characters/${row.background_image_url.split('/').pop()}`
  //             : (row.outfit_image_url || 'assets/characters/summer_anime.png'),
  //           text_clothing: row.text_clothing || 'Ropa recomendada',
  //           accessories: UIStyles.accessories,
  //           // AQUÍ USAMOS LAS PROPIEDADES ESTÁTICAS PARA EVITAR ERRORES DE RENDER
  //           primaryLottieOptions: this.getLottiePropByCode(row.weathercode ?? 0, row.is_day ?? 1),
  //           pronostico_meteo: horasArray
  //         } as WeatherLocationData;
  //       }
  //       return null;
  //     });

  //     const results = await Promise.all(promises);

  //     // 5. Filtramos nulos y actualizamos estado
  //     this.weatherData = results.filter((item): item is WeatherLocationData => item !== null);

  //     if (this.weatherData.length === 0) {
  //       this.generateFallbackData();
  //     }

  //     this.loader = true;
  //     this.cdr.detectChanges();

  //     // 6. Inicialización del carrusel una vez el DOM está listo
  //     setTimeout(() => {
  //       this.initializeSwiper();
  //     }, 300);

  //   } catch (error) {
  //     console.error('❌ Error crítico en la carga de datos:', error);
  //     this.generateFallbackData();
  //     this.loader = true;
  //     this.cdr.detectChanges();
  //   }
  // }
  /**
   * Mapeador Maestro de códigos meteorológicos de la WMO a Objetos Lottie estáticos
   */
  // getLottieOptionsByCode(code: number, isDay: number): AnimationOptions {
  //   let animationData;

  //   // Clasificación oficial de códigos Open-Meteo / WMO
  //   if ([0].includes(code)) {
  //     animationData = isDay === 1 ? sunnyAnimation : nightAnimation;
  //   } else if ([1, 2].includes(code)) {
  //     animationData = isDay === 1 ? cloudyDayAnimation : cloudyNightAnimation;
  //   } else if ([3].includes(code)) {
  //     animationData = cloudyAnimation;
  //   } else if ([45, 48].includes(code)) {
  //     animationData = fogAnimation;
  //   } else if ([51, 53, 55].includes(code)) {
  //     animationData = drizzleAnimation;
  //   } else if ([61, 63, 65, 80, 81, 82].includes(code)) {
  //     animationData = rainAnimation;
  //   } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
  //     animationData = snowAnimation;
  //   } else if ([95, 96, 99].includes(code)) {
  //     animationData = stormAnimation;
  //   } else {
  //     animationData = isDay === 1 ? sunnyAnimation : nightAnimation;
  //   }

  //   return { loop: true, autoplay: true, animationData, renderer: 'svg' };
  // }


  // async loadWeatherData() {
  //     try {
  //       this.loader = false;
  //       this.weatherData = await Promise.all(
  //         this.locations.map(async location => {
  //           const data = await this.supabaseService.getMeteoCondition(location); // Corrección de 'supabase' a 'supabaseService'
  //           const createdAt = data?.created_at ? new Date(data.created_at) : null;
  //           const lottiePath = this.getWeatherLottiePath(data?.background || 'sunny');
  //           return {
  //             location: data?.location || location || 'N/A',
  //             temp: data?.temp || 'N/A',
  //             apparentTemp: data?.apparentTemp || 'N/A',
  //             precipitation: data?.precipitation || 'N/A',
  //             windSpeed: data?.windSpeed || 'N/A',
  //             isDay: data?.isDay || 0,
  //             date: createdAt,
  //             time: createdAt?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'N/A',
  //             background: data?.background || '/assets/backgrounds/soleado.jpg',
  //             background_image_url: data?.background_image_url || '/assets/backgrounds/soleado.jpg',
  //             outfit_image_url: data?.outfit_image_url ||  '/assets/backgrounds/prototipo.png',
  //             description: data?.description || 'N/A',
  //             lottieOptions: {
  //                 path: `assets/lottie/${lottiePath}`,
  //               }
  //           };
  //         })
  //       );
  //       if (this.weatherData.length === 0) {
  //         this.weatherData = this.locations.map(location => ({
  //           location: String(location),
  //           temp: 'N/A',
  //           apparentTemp: 'N/A',
  //           precipitation: 'N/A',
  //           windSpeed: 'N/A',
  //           date: null,
  //           time: 'N/A',
  //           background: '/assets/backgrounds/soleado.jpg',
  //           background_image_url: '/assets/backgrounds/soleado.jpg',
  //           outfit_image_url:'/assets/backgrounds/prototipo.png',
  //           description: 'N/A'
  //         }));
  //       }
  //       this.loader = true;
  //       this.cdr.detectChanges();
  //       setTimeout(() => {
  //         this.initializeSwiper();
  //       }, 1000);
  //     } catch (error) {
  //       console.error('Error loading weather data:', error);
  //       this.loader = true;
  //       this.weatherData = this.locations.map(location => ({
  //         location: String(location),
  //         temp: 'N/A',
  //         apparentTemp: 'N/A',
  //         precipitation: 'N/A',
  //         windSpeed: 'N/A',
  //         date: null,
  //         time: 'N/A',
  //         background: '/assets/backgrounds/soleado.jpg',
  //         background_image_url: '/assets/backgrounds/soleado.jpg',
  //         outfit_image_url:'/assets/backgrounds/prototipo.png',
  //         description: 'N/A'
  //       }));
  //       this.cdr.detectChanges();
  //       setTimeout(() => {
  //         this.initializeSwiper();
  //       }, 1000);
  //     }
  // }

  /**
   * Proveedor Dinámico para los Smart Chips de indicadores
   */
  getIndicatorOptions(type: string): AnimationOptions {
    let animationData;
    switch (type) {
      case 'temp': animationData = tempIndicator; break;
      case 'humidity': animationData = humidityIndicator; break;
      case 'wind': animationData = windIndicator; break;
      case 'uv': animationData = uvIndicator; break;
      case 'rain_chance': animationData = rainChanceIndicator; break;
      default: animationData = tempIndicator;
    }
    return { loop: true, autoplay: true, animationData, renderer: 'svg' };
  }

  //  getIndicatorOptions(type: string): AnimationOptions {
  //   let animationData;
  //   switch (type) {
  //     case 'temp': animationData = tempIndicator; break;
  //     case 'humidity': animationData = humidityIndicator; break;
  //     case 'wind': animationData = windIndicator; break;
  //     case 'uv': animationData = uvIndicator; break;
  //     //case 'pressure': animationData = pressureIndicator; break;
  //     default: animationData = tempIndicator;
  //   }
  //   return { loop: true, autoplay: true, animationData };
  // }



  // async getWeather() {
  //   try {
  //     // 1. Lanzamos las peticiones en paralelo para respetar el orden estricto del array 'locations'
  //     const promises = this.locations.map(async (town) => {
  //       const res = await this.supabaseService.getDataByLocation(town);

  //       // Si Supabase devuelve datos para ese pueblo, estructuramos el objeto para el HTML
  //       if (res && res.length > 0) {
  //         const row = res[0]; // Extraemos la fila real de datos

  //         return {
  //           location: row.location,
  //           date: row.timestamp ? new Date(row.timestamp) : new Date(),
  //           temp: row.temperature_2m, // Mapeamos 'temperature_2m' a 'temp' tal como pide tu HTML
  //           windSpeed: row.wind_speed_10m || 0,
  //           //uvIndex: row.uv_index || 0,
  //           uvIndex:  0,
  //           background_image_url: row.background_image_url || 'assets/backgrounds/soleado.jpg',
  //           outfit_image_url: row.outfit_image_url || 'assets/backgrounds/OUTFIT_HOT.png',
  //           text_clothing: 'Ropa cómoda'
  //         };
  //       }
  //       return null;
  //     });

  //     // 2. Esperamos de forma ordenada la resolución de todos los pueblos
  //     const results = await Promise.all(promises);

  //     // 3. Filtramos los valores nulos por si algún pueblo fallara en la base de datos
  //     this.weatherData = results.filter(item => item !== null && item !== undefined);

  //     console.log('📊 Datos meteorológicos acoplados a la UI en orden estricto:', this.weatherData);

  //     // 4. Desactivamos el esqueleto/pantalla de carga y actualizamos la vista de Angular
  //     this.loader = true;
  //     this.cdr.detectChanges();

  //     // 5. Inicializamos el Swiper una vez que los datos ya están renderizados en el DOM
  //     setTimeout(() => {
  //       this.initializeSwiper();
  //     }, 200);

  //   } catch (error) {
  //     console.error('❌ Error crítico en el flujo de getWeather:', error);
  //     this.loader = true;
  //     this.cdr.detectChanges();
  //   }
  // }

  // async getWeather() {
  //   this.locations.forEach(async (element) => {
  //     // Nota: Aquí usabas this.supabaseService.getDataByLocation pero en tu flujo real dependías de las reglas
  //     const res = await this.supabaseService.getDataByLocation(element);
  //     console.log('Resultados de las condiciones:', res);
  //     if (res) {
  //       this.weatherData.push(res);
  //     }
  //   });
  //   console.log('this.weatherData--->', this.weatherData);
  // }


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

  getCustomDate(dateInput: any): string {
    if (!dateInput) return '';
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    let formatted = date.toLocaleDateString('es-ES', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  getLottieOptions(iconName: string): AnimationOptions {
    let animationData;
    switch (iconName) {
      case 'sunny': animationData = sunnyAnimation; break;
      case 'night': animationData = nightAnimation; break;
      case 'cloudy-day': animationData = cloudyDayAnimation; break;
      case 'cloudy-night': animationData = cloudyNightAnimation; break;
      case 'cloudy': animationData = cloudyAnimation; break;
      case 'drizzle': animationData = drizzleAnimation; break;
      case 'rain': animationData = rainAnimation; break;
      case 'storm': animationData = stormAnimation; break;
      case 'snow': animationData = snowAnimation; break;
      case 'fog': animationData = fogAnimation; break;
      default: animationData = sunnyAnimation;
    }
    return { loop: true, autoplay: true, animationData };
  }



  getClothingIcon(outfitUrl: string): string {
    return outfitUrl ? outfitUrl : 'assets/backgrounds/OUTFIT_HOT.png';
  }

  toggleInfoCard() {
    this.isInfoCardExpanded = !this.isInfoCardExpanded;
    this.cdr.detectChanges();
  }

  openLocationDetailModal() {
    this.isLocationModalOpen = true;
    this.cdr.detectChanges();
  }

  selectTownByIndex(index: number) {
    if (index === this.activeIndex) {
      this.isLocationModalOpen = false;
      return;
    }
    this.activeIndex = index;
    if (this.swiperInstance) {
      this.swiperInstance.slideTo(index, 400);
    }
    this.isLocationModalOpen = false;
    this.cdr.detectChanges();
  }

  // selectTownByIndex(index: number) {
  //   if (index === this.activeIndex) {
  //     console.log('ℹ️ El usuario seleccionó el pueblo que ya estaba activo. Cerrando modal.');
  //     this.isLocationModalOpen = false;
  //     this.cdr.detectChanges();
  //     return;
  //   }

  //   // 1. Actualizamos el índice activo global
  //   this.activeIndex = index;

  //   // 2. Desplazamos el Swiper de fondo al slide correspondiente de manera fluida
  //   if (this.swiperInstance) {
  //     this.swiperInstance.slideTo(index, 400); // 400ms de transición de cristal suave
  //   }

  //   // 3. Cerramos el modal cambiando su propiedad de estado a falso
  //   this.isLocationModalOpen = false;

  //   // 4. Forzamos al detector de cambios de Angular a repintar la UI (Temperaturas, Outfit, Lotties)
  //   this.cdr.detectChanges();

  //   console.log('✅ Ubicación cambiada con éxito a:', this.weatherData[index].location, '| Índice:', index);
  // }

  onLocationModalDismissed() {
    this.isLocationModalOpen = false;
    this.cdr.detectChanges();
  }

  getWeatherLottiePath(background: string): string {
    const bg = background.toLowerCase();
    if (bg.includes('sunny') || bg.includes('soleado')) return 'weather-sunny.json';
    if (bg.includes('cloudy') || bg.includes('nublado')) return 'weather-cloudy.json';
    if (bg.includes('rain') || bg.includes('lluvia')) return 'weather-rain.json';
    if (bg.includes('storm') || bg.includes('tormenta')) return 'weather-storm.json';
    if (bg.includes('night') || bg.includes('noche')) return 'weather-night.json';
    return 'weather-sunny.json'; // Fallback
  }

  ngOnDestroy() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      console.log('Swiper instance destroyed');
    }
  }



  private generateFallbackData() {
    this.weatherData = this.locations.map(location => ({
      location: location,
      date: new Date(),
      time: '00:00',
      temp: 20,
      apparentTemp: 20,
      humidity: 50,
      precipitation: 0,
      windSpeed: 10,
      uvIndex: 4,
      pressure: 1013,
      weathercode: 0,
      isDay: 1,
      background_image_url: 'assets/backgrounds/soleado.jpg',
      outfit_image_url: 'assets/characters/summer_anime.png',
      text_clothing: 'Ropa cómoda',
      accessories: [],
      primaryLottieOptions: { animationData: sunnyAnimation, loop: true, autoplay: true },
      pronostico_meteo: []
    }));
  }


  /**
   * MOTOR DE REGLAS: Mapea WeatherData a estilos visuales y accesorios usando constantes.
   */
  // mapWeatherToBackgroundAccessories(item: WeatherData): { background: string, accessories: string[] } {
  //   // 1. Extracción con valores por defecto seguros
  //   const weatherCode = Number(item.weathercode ?? -1);
  //   const isDay = Number(item.is_day ?? 1);
  //   const cloudcover = Number(item.cloudcover ?? 0);
  //   const temperature = Number(item.temperature_2m ?? 0);
  //   const precipitation = Number(item.precipitation ?? 0);
  //   const windSpeed = Number(item.wind_speed_10m ?? 0);
  //   const visibility = Number(item.visibility ?? 100000);
  //   const relativeHumidity = Number(item.relative_humidity_2m ?? 0);
  //   const apparentTemperature = Number(item.apparent_temperature ?? 0);

  //   // 2. Definición de Constantes de Umbral
  //   const WIND_SPEED_THRESHOLD = 15;
  //   const TEMPERATURE_COLD_THRESHOLD = 10;
  //   const APPARENT_TEMPERATURE_COLD_THRESHOLD = 5;
  //   const TEMPERATURE_VERY_COLD_THRESHOLD = 0;
  //   const VISIBILITY_FOG_THRESHOLD = 1000;
  //   const HUMIDITY_FOG_THRESHOLD = 90;
  //   const TEMPERATURE_HOT_THRESHOLD = 25;
  //   const CLOUDCOVER_CLEAR_THRESHOLD = 20;
  //   const WIND_SPEED_CALM_THRESHOLD = 5;

  //   let background = 'soleado.jpg'; // Fallback base
  //   const accessories: string[] = [];

  //   // --- LÓGICA DE REGLAS ---

  //   if (windSpeed > WIND_SPEED_THRESHOLD && isDay === 0 && precipitation === 0) {
  //     background = 'vientofuerte_noche.jpg';
  //     accessories.push('cortaviento');
  //     if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) accessories.push('bufanda');
  //     if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) accessories.push('abrigo-polar');
  //   }
  //   else if (windSpeed > WIND_SPEED_THRESHOLD) {
  //     background = 'vientofuerte.jpg';
  //     accessories.push('cortaviento');
  //     if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) accessories.push('bufanda');
  //     if (temperature < TEMPERATURE_VERY_COLD_THRESHOLD || apparentTemperature < TEMPERATURE_VERY_COLD_THRESHOLD) accessories.push('abrigo-polar');
  //   }
  //   else if (weatherCode === 0 && isDay === 0) {
  //     background = 'nochedespejada.jpg';
  //   }
  //   else if ((weatherCode === 3 || weatherCode >= 61) && isDay === 0) {
  //     background = 'noche_nublada_luna.jpg';
  //     accessories.push('bufanda');
  //   }
  //   else if (weatherCode === 0 && isDay === 1) {
  //     background = 'despejado_clear.jpg';
  //   }
  //   else if ((weatherCode === 1 || weatherCode === 2) && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
  //     background = 'soleado.jpg';
  //     accessories.push('gafas', 'gorra');
  //   }
  //   else if (weatherCode === 2 && cloudcover >= CLOUDCOVER_CLEAR_THRESHOLD && isDay === 1) {
  //     background = 'parcialmentenublado.jpg';
  //   }
  //   else if (weatherCode === 3 && isDay === 1) {
  //     background = 'nublado_cloudy.jpg';
  //     accessories.push('bufanda');
  //   }
  //   else if ([95, 96, 99].includes(weatherCode)) {
  //     background = 'tormenta_thunder.jpg';
  //     accessories.push('paraguas', 'impermeable');
  //   }
  //   else if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) {
  //     background = 'lluvia_rain.jpg';
  //     accessories.push('paraguas', 'impermeable');
  //     if (temperature < TEMPERATURE_COLD_THRESHOLD || apparentTemperature < APPARENT_TEMPERATURE_COLD_THRESHOLD) accessories.push('abrigo-polar');
  //   }
  //   else if ([51, 53, 55].includes(weatherCode)) {
  //     background = 'llovisnaDrizzle.jpg';
  //     accessories.push('paraguas');
  //   }
  //   else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
  //     background = 'helada_escarcha.jpg';
  //     accessories.push('abrigo-polar', 'botas');
  //   }
  //   else if (temperature <= TEMPERATURE_VERY_COLD_THRESHOLD && precipitation === 0 && [0, 1, 2, 3].includes(weatherCode)) {
  //     background = 'helada_escarcha2.jpg';
  //     accessories.push('bufanda', 'guantes');
  //   }
  //   else if ([45, 48].includes(weatherCode) || visibility < VISIBILITY_FOG_THRESHOLD || relativeHumidity > HUMIDITY_FOG_THRESHOLD) {
  //     background = 'nieblafog.jpg';
  //     accessories.push('bufanda');
  //   }
  //   else if ([0, 1, 2].includes(weatherCode) && temperature > TEMPERATURE_HOT_THRESHOLD && cloudcover < CLOUDCOVER_CLEAR_THRESHOLD && windSpeed < WIND_SPEED_CALM_THRESHOLD) {
  //     background = 'bruma_calima.jpg';
  //   }

  //   return {
  //     background: background,
  //     accessories: [...new Set(accessories)].filter(acc => acc)
  //   };
  // }

  getLottiePropByCode(code: number, isDay: number): AnimationOptions {
    if ([0].includes(code)) return isDay === 1 ? this.sunnyLottie : this.nightLottie;
    if ([1, 2].includes(code)) return isDay === 1 ? this.cloudyDayLottie : this.cloudyNightLottie;
    if ([3].includes(code)) return this.cloudyLottie;
    if ([45, 48].includes(code)) return this.fogLottie;
    if ([51, 53, 55].includes(code)) return this.drizzleLottie;
    if ([61, 63, 65, 80, 81, 82].includes(code)) return this.rainLottie;
    if ([71, 73, 75, 77, 85, 86].includes(code)) return this.snowLottie;
    if ([95, 96, 99].includes(code)) return this.stormLottie;

    return this.sunnyLottie; // Fallback
  }

}
