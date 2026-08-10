

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
export interface HourlyForecast {
  time: string;                     // "2026-08-08T17:00"
  horaFormatted?: string;           // Propiedad helper inyectada en Front: "17:00"
  temperature_2m: number;           // 27.4
  apparent_temperature: number;     // 33.7
  wind_gusts_10m: number;          // 51.5
  precipitation_probability: number;// 0
  precipitation: number;            // 0
  relative_humidity_2m: number;     // 12
  dewpoint_2m: number;              // -3.7
  cloudcover: number;               // 73
  weathercode: number;              // 2
  is_day: number;                   // 1 (¡Atención: es 'is_day', no 'es_dia'!)
  background_image_url: string;     // "assets/backgrounds/nublado1.webp"
  lottieOptions?: AnimationOptions; // Inyectado para ngx-lottie
}
// interface HourlyForecast {
//   fecha_hora: string;
//   hora: string;
//   temp: number;
//   sensacion: number;
//   weathercode: number;
//   pop: number;
//   lluvia_mm: number;
//   uv: number;
//   viento_kmh: number;
//   es_dia: number;
//   lottieOptions?: AnimationOptions; // Inyectado dinámicamente en el Front
// }




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
  soilMoisture: number; // <--- AÑADIDO
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



  mapLottieOptions: AnimationOptions = {animationData: mapAnimation,loop: true,autoplay: true,renderer: 'svg' };
  //earthIndicatorOptions: AnimationOptions = { animationData: earthIndicator, loop: true, autoplay: true, renderer: 'svg' };

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



      // 1. Deserialización del pronóstico por horas (JSONB)
      let horasArray: HourlyForecast[] = [];
      if (row.pronostico_meteo) {
        try {
          const parsed: HourlyForecast[] = typeof row.pronostico_meteo === 'string'
            ? JSON.parse(row.pronostico_meteo)
            : row.pronostico_meteo;

          // A) Mapear Lottie y formatear la hora textual "HH:mm"
          const mapaCompleto: HourlyForecast[] = parsed.map((item) => {
            // Extrae "17:00" de "2026-08-08T17:00"
            const horaFormateada = item.time && item.time.includes('T')
              ? item.time.split('T')[1].substring(0, 5)
              : '00:00';

            return {
              ...item,
              horaFormatted: horaFormateada,
              // CORREGIDO: Usamos item.is_day (propiedad exacta del JSON)
              lottieOptions: this.getLottiePropByCode(item.weathercode ?? 0, item.is_day ?? 1)
            };
          });

          // B) Localizar la hora actual para obtener las 6 horas siguientes
          const fechaHoraRegistro = row.created_at ? new Date(row.created_at) : new Date();
          const horaActualNum = fechaHoraRegistro.getHours();
          const horaActualStr = horaActualNum.toString().padStart(2, '0');

          // Obtenemos "YYYY-MM-DD"
          const fechaISO = fechaHoraRegistro.toISOString().split('T')[0];
          const patronBusqueda = `${fechaISO}T${horaActualStr}:00`;

          const indiceActual = mapaCompleto.findIndex(h => h.time.startsWith(patronBusqueda));
          const inicio = indiceActual !== -1 ? indiceActual + 1 : 0;

          // Tomamos exactamente los 6 elementos futuros
          horasArray = mapaCompleto.slice(inicio, inicio + 6);

        } catch (e) {
          console.error(`❌ Error parseando 'pronostico_meteo' para ${town}:`, e);
        }
      }
      // let horasArray: HourlyForecast[] = [];
      // if (row.pronostico_meteo) {
      //   try {
      //     const parsed = typeof row.pronostico_meteo === 'string'
      //       ? JSON.parse(row.pronostico_meteo)
      //       : row.pronostico_meteo;

      //     horasArray = parsed.map((hora: any) => ({
      //       ...hora,
      //       lottieOptions: this.getLottiePropByCode(hora.weathercode, hora.es_dia)
      //     }));
      //   } catch (e) {
      //     console.error(`❌ Error parseando 'pronostico_meteo' (JSONB) para ${town}:`, e);
      //   }
      // }

      // 2. RESOLUCIÓN DE FONDOS (CAPA A - Estrictamente desde Backend)
      let finalBg = 'assets/backgrounds/soleado.jpg';
      if (row.background_image_url && row.background_image_url.trim() !== '') {
        finalBg = row.background_image_url;
      }

      // 3. RESOLUCIÓN DE OUTFITS

      let finalOutfit = 'assets/characters/nubio_hot.webp';
      if (row.outfit_image_url && row.outfit_image_url.trim() !== '') {
        finalOutfit = row.outfit_image_url;
      }

      return {
        location: row.location || town,
        date: row.created_at ? new Date(row.created_at) : new Date(),
        time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        temp: row.temperature_2m ?? 0,
        apparentTemp: row.apparent_temperature ?? row.temperature_2m ?? 0,
        humidity: row.relative_humidity_2m ?? 0,
        precipitation: row.precipitation_probability ?? 0,
        windSpeed: row.wind_speed_10m ?? 0,
        uvIndex: row.uv_index ?? 0,
        soilMoisture: row.soil_moisture_0_to_10cm ? Math.round(row.soil_moisture_0_to_10cm * 100) : 0,
        pressure: row.pressure_msl ?? 1013,
        weathercode: row.weathercode ?? 0,
        isDay: row.is_day ?? 1,
        background_image_url: finalBg,
        outfit_image_url: finalOutfit,
        text_clothing: row.text_clothing || 'Ropa recomendada',
        accessories: [], // Se deja vacío ya que el motor pasó al C#
        primaryLottieOptions: this.getLottiePropByCode(row.weathercode ?? 0, row.is_day ?? 1),
        pronostico_meteo: horasArray
      } as WeatherLocationData;

      // 2. Ejecutar motor de reglas local para obtener accesorios y fondos salvavidas
      // const UIStyles = this.mapWeatherToBackgroundAccessories(row);

      // // 3. RESOLUCIÓN Y LOGS DE FONDOS (INTERACCIÓN CON SUPABASE)
      // let finalBg = '';

      // if (row.background_image_url && row.background_image_url.trim() !== '') {
      //   // Si Supabase devuelve una ruta, la usamos.
      //   finalBg = row.background_image_url;

      //   // Alerta en consola si detectamos el String obsoleto/erroneo 'soelado' en el registro
      //   if (finalBg.includes('soleado')) {
      //     console.warn(
      //       `🚨 [MeteoApp Supabase Mismatch] Se detectó el archivo obsoleto 'soelado' en la base de datos para '${town}'. Corrigiendo a 'soleado.jpg' en caliente.`
      //     );
      //     finalBg = 'assets/backgrounds/soleado.jpg';
      //   }
      // } else {
      //   // --- LOG SOLICITADO: Imagen no encontrada en Supabase ---
      //   console.warn(
      //     `ℹ️ [MeteoApp Fallback] Supabase NO devolvió 'background_image_url' (campo vacío/nulo) para '${town}'. Activando imagen de contingencia local: '${UIStyles.background}'`
      //   );
      //   finalBg = `assets/backgrounds/${UIStyles.background}`;
      // }

      // // 4. RESOLUCIÓN Y LOGS DE OUTFITS (PERSONAJES)
      // let finalOutfit = '';
      // if (row.outfit_image_url && row.outfit_image_url.trim() !== '') {
      //   finalOutfit = row.outfit_image_url;
      // } else {
      //   console.warn(
      //     `ℹ️ [MeteoApp Fallback] Supabase NO devolvió 'outfit_image_url' para '${town}'. Colocando personaje por defecto.`
      //   );
      //   finalOutfit = 'assets/characters/summer_anime.png';
      // }

      // return {
      //   location: row.location || town,
      //   date: row.created_at ? new Date(row.created_at) : new Date(),
      //   time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      //   temp: row.temperature_2m ?? 0,
      //   apparentTemp: row.apparent_temperature ?? row.temperature_2m ?? 0,
      //   humidity: row.relative_humidity_2m ?? 0,
      //   precipitation: row.precipitation ?? 0,
      //   windSpeed: row.wind_speed_10m ?? 0,
      //   uvIndex: row.uv_index ?? 0,
      //   pressure: row.pressure_msl ?? 1013,
      //   weathercode: row.weathercode ?? 0,
      //   isDay: row.is_day ?? 1,
      //   background_image_url: finalBg, // Ruta limpia y validada lista para el HTML
      //   outfit_image_url: finalOutfit,
      //   text_clothing: row.text_clothing || 'Ropa recomendada',
      //   accessories: UIStyles.accessories,
      //   primaryLottieOptions: this.getLottiePropByCode(row.weathercode ?? 0, row.is_day ?? 1),
      //   pronostico_meteo: horasArray
      // } as WeatherLocationData;


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


// mapWeatherToBackgroundAccessories(item: WeatherData): { background: string, accessories: string[] } {
//   const weatherCode = Number(item.weathercode ?? -1);
//   const isDay = Number(item.is_day ?? 1);
//   const cloudcover = Number(item.cloudcover ?? 0);
//   const temperature = Number(item.temperature_2m ?? 0);
//   const precipitation = Number(item.precipitation ?? 0);
//   const windSpeed = Number(item.wind_speed_10m ?? 0);
//   const visibility = Number(item.visibility ?? 100000);
//   const relativeHumidity = Number(item.relative_humidity_2m ?? 0);
//   const uvIndex = Number(item.uv_index ?? 0);

//   // =========================================================================
//   // CONFIGURACIÓN DE UMBRALES DE NEGOCIO EXPERTOS (MADRID NORTE / CAMPINAS)
//   // =========================================================================
//   const NORTH_MADRID_WIND_LIMIT = 22;      // Viento molesto y racheado en los páramos (km/h)
//   const NORTH_MADRID_HOT_LIMIT = 31;       // Calor sofocante continental de la meseta (°C)
//   const NORTH_MADRID_COLD_LIMIT = 8;       // Umbral de abrigo obligado en la zona norte (°C)
//   const NORTH_MADRID_FREEZING_LIMIT = 2;   // Riesgo de escarcha/helada real en la vega del Jarama (°C)
//   const NORTH_MADRID_RAIN_STRONG = 1.8;    // Saturación: el suelo arcilloso se vuelve barrizal (mm)
//   const NORTH_MADRID_CALM_WIND = 5;        // Viento nulo que estanca partículas y calima (km/h)
//   const VISIBILITY_FOG_LIMIT = 1000;       // Niebla física real en metros

//   // Imagen salvavidas absoluta por defecto si falla el motor
//   let background = 'soleado.jpg';
//   const accessories: string[] = [];

//   // =========================================================================
//   // REGLAS DE PRIORIDAD VISUAL REALISTA
//   // =========================================================================

//   // 1. CONTROL DE PRECIPITACIONES CRÍTICAS (Tormentas e Intensidades)
//   if ([95, 96, 99].includes(weatherCode)) {
//     background = 'tormenta.jpg';
//     accessories.push('paraguas', 'impermeable');
//   }
//   else if (precipitation > NORTH_MADRID_RAIN_STRONG || [65, 82].includes(weatherCode)) {
//     background = 'lluvia_fuerte.jpg';
//     accessories.push('paraguas', 'impermeable');
//   }
//   else if (precipitation > 0 || [51, 53, 55, 61, 80].includes(weatherCode)) {
//     background = 'lluvia_ligera.jpg';
//     accessories.push('paraguas');
//   }

//   // 2. EXTREMOS TÉRMICOS Y RADIACIÓN ULTRAVIOLETA
//   else if (isDay === 1 && uvIndex >= 7) {
//     background = 'uv_extremo.jpg';
//     accessories.push('gafas', 'gorra');
//   }
//   else if (isDay === 1 && uvIndex >= 5) {
//     background = 'uv_alto.jpg';
//     accessories.push('gafas', 'gorra');
//   }
//   else if (temperature >= NORTH_MADRID_HOT_LIMIT && isDay === 1) {
//     background = 'caluroso.jpg';
//     accessories.push('gafas', 'gorra');
//   }

//   // 3. FENÓMENOS ATMOSFÉRICOS DINÁMICOS (Viento, Niebla del Río y Calima)
//   else if (windSpeed >= NORTH_MADRID_WIND_LIMIT) {
//     background = 'viento_fuerte.jpg';
//     accessories.push('cortaviento');
//     if (temperature < NORTH_MADRID_COLD_LIMIT) accessories.push('bufanda');
//   }
//   else if ([45, 48].includes(weatherCode) || visibility < VISIBILITY_FOG_LIMIT) {
//     background = 'niebla.jpg';
//     accessories.push('bufanda');
//   }
//   else if (temperature >= 28 && windSpeed <= NORTH_MADRID_CALM_WIND && relativeHumidity < 30) {
//     // Atmósfera pesada de polvo sahariano en suspensión en Fuente el Saz / Algete
//     background = 'calima.jpg';
//   }

//   // 4. INVIERNO, CONDICIONES TÉRMICA1S BAJAS Y ESCARCHAS DE VEGA
//   else if ([71, 73, 75, 85, 86].includes(weatherCode)) {
//     background = 'nieve_intensa.jpg';
//     accessories.push('abrigo-polar', 'botas', 'guantes');
//   }
//   else if (temperature <= NORTH_MADRID_FREEZING_LIMIT) {
//     background = 'frio.jpg'; // Activa visual de frío / escarcha matinal de páramo
//     accessories.push('bufanda', 'guantes', 'abrigo-polar');
//   }

//   // 5. ESTADOS BASE / CIELOS ESTABLES RECONSTRUIDOS
//   else if (isDay === 0) {
//     // Escenario Nocturno Estándar
//     if (weatherCode >= 3 || cloudcover >= 50) {
//       background = 'nublado.jpg'; // Tránsito a noche cerrada nublada
//     } else {
//       background = 'calma.jpg'; // Noche despejada y tranquila en los pueblos
//     }
//   }
//   else {
//     // Escenario Diurno Estándar
//     if (weatherCode === 0 || cloudcover < 20) {
//       background = 'clara.jpg'; // Cielo completamente limpio y azul
//     } else if (weatherCode === 3 || cloudcover >= 60) {
//       background = 'nublado.jpg'; // Día gris tapado sin lluvia
//     } else {
//       background = 'soleado.jpg'; // Intervalos nubosos estables con sol
//       accessories.push('gafas');
//     }
//   }

//   // Retorno limpio purgando duplicados de accesorios
//   return {
//     background: background,
//     accessories: [...new Set(accessories)].filter(acc => acc)
//   };
// }


  /**
   * Proveedor Dinámico para los Smart Chips de indicadores
   */
  // getIndicatorOptions(type: string): AnimationOptions {
  //   let animationData;
  //   switch (type) {
  //     case 'temp': animationData = tempIndicator; break;
  //     case 'humidity': animationData = humidityIndicator; break;
  //     case 'wind': animationData = windIndicator; break;
  //     case 'uv': animationData = uvIndicator; break;
  //     case 'rain_chance': animationData = rainChanceIndicator; break;
  //     default: animationData = tempIndicator;
  //   }
  //   return { loop: true, autoplay: true, animationData, renderer: 'svg' };
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
      soilMoisture: 35, // <--- AÑADIDO AQUÍ PARA CUMPLIR CON LA INTERFAZ
      pressure: 1013,
      weathercode: 0,
      isDay: 1,
      background_image_url: 'assets/backgrounds/soleado.jpg',
      outfit_image_url: 'assets/characters/nubio_hot.webp',
      text_clothing: 'Ropa cómoda',
      accessories: [],
      primaryLottieOptions: this.sunnyLottie, // Actualizado para usar la variable segura
      pronostico_meteo: []
    }));
  }

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
