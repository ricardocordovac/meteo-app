

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
import { AlertaCualitativa, HourlyForecast, WeatherData, WeatherLocationData } from 'src/app/interfaces/weather-data.interface';




SwiperCore.use([Navigation, Pagination]);


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
  isAlertsModalOpen: boolean = false;

  // Detección de plataforma móvil nativa
  isIos: boolean = false;
  isAndroid: boolean = false;

  // Listado estricto de municipios bajo cobertura meteorológica
  locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
  weatherData: WeatherLocationData[] = [];

  // Control de la hora seleccionada en el carrusel (si es null, muestra el tiempo real en vivo)
  selectedHour: HourlyForecast | null = null;

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
        this.selectedHour = null;
        this.cdr.detectChanges();
      });
      this.swiperInstance.update();
    }
  }

  /**
   * Resuelve dinámicamente si debe mostrar el fondo del hito seleccionado o el general del municipio
   */
  getCurrentBackground(data: WeatherLocationData, index: number): string {
    if (index === this.activeIndex && this.selectedHour && this.selectedHour.background_image_url) {
      return `url(${this.selectedHour.background_image_url})`;
    }
    return `url(${data.background_image_url})`;
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

        // 1. Deserialización optimizada de los 6 Hitos de Oro (lee 'pronostico_hitos' con respaldo en 'pronostico_meteo')
  // 1. Deserialización de los 6 Hitos de Oro (EXTRACCIÓN A PRUEBA DE BALAS)
        let hitosArray: HourlyForecast[] = [];
        let fuenteHitos = (row as any).pronostico_hitos;

        if (fuenteHitos) {
          try {
            let parsed = fuenteHitos;

            // 🛡️ BUCLE DESEMPAQUETADOR (Efecto Matrioska)
            // Desempaqueta tantas veces como el backend lo haya convertido en string (hasta 3 capas)
            let ciclos = 0;
            while (typeof parsed === 'string' && ciclos < 3) {
              try {
                parsed = JSON.parse(parsed);
              } catch (err) {
                // Si JSON.parse falla por culpa de las barras invertidas rebeldes del C#, limpiamos a mano
                parsed = parsed.replace(/^"|"$/g, '').replace(/\\"/g, '"');
              }
              ciclos++;
            }

            // 🎯 VERIFICACIÓN FINAL: ¿Logramos sacar el Array real?
            if (Array.isArray(parsed)) {
              console.log(`✅ [${town}] Hitos extraídos con éxito:`, parsed);

              hitosArray = parsed.map((item: any) => {
                // Si C# manda item.hora ("19:00"), la usa. Si no, la extrae del "time"
                const horaFinal = item.hora ? item.hora : (item.time && item.time.includes('T')
                  ? item.time.split('T')[1].substring(0, 5)
                  : '00:00');

                return {
                  ...item,
                  hora: horaFinal,
                  horaFormatted: horaFinal,
                  lottieOptions: this.getLottiePropByCode(item.weathercode ?? 0, item.is_day ?? 1)
                };
              });
            } else {
              console.warn(`⚠️ [${town}] La columna 'pronostico_hitos' se procesó, pero no es un Array:`, parsed);
            }

          } catch (e) {
            console.error(`❌ Error crítico desempaquetando 'pronostico_hitos' para ${town}:`, e);
          }
        }


        // 2. RESOLUCIÓN DE FONDOS
        let finalBg = 'assets/backgrounds/soleado.jpg';
        if (row.background_image_url && row.background_image_url.trim() !== '') {
          finalBg = row.background_image_url;
        }

        // 3. RESOLUCIÓN DE OUTFITS
        let finalOutfit = 'assets/characters/nubio_hot.webp';
        if (row.outfit_image_url && row.outfit_image_url.trim() !== '') {
          finalOutfit = row.outfit_image_url;
        }


      // --- DESERIALIZACIÓN DE ALERTAS HIPERLOCALES (alerts_jsonb) ---
      let alertasArray: AlertaCualitativa[] = [];
      let fuenteAlertas = (row as any).alerts_jsonb || (row as any).alerts_json;

      if (fuenteAlertas) {
        try {
          let parsedAlerts = fuenteAlertas;
          let ciclosAlertas = 0;

          // Desempaqueta hasta 3 capas por si viene como String con escape de comillas
          while (typeof parsedAlerts === 'string' && ciclosAlertas < 3) {
            try {
              parsedAlerts = JSON.parse(parsedAlerts);
            } catch (err) {
              parsedAlerts = parsedAlerts.replace(/^"|"$/g, '').replace(/\\"/g, '"');
            }
            ciclosAlertas++;
          }

          if (Array.isArray(parsedAlerts)) {
            alertasArray = parsedAlerts;
          }
        } catch (e) {
          console.error(`❌ Error desempaquetando alerts_jsonb para ${town}:`, e);
        }
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
            accessories: [],
            primaryLottieOptions: this.getLottiePropByCode(row.weathercode ?? 0, row.is_day ?? 1),
            pronostico_meteo: [],
            pronostico_hitos: hitosArray,
            alertas: alertasArray // 👈 Inyección tipada directa
      } as WeatherLocationData;
      });

      const results = await Promise.all(promises);
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
    this.selectedHour = null; // 🌟 Resetea la hora seleccionada al cambiar de municipio
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
      pronostico_meteo: [],
      pronostico_hitos: [], // 🎯 Añadido
      alertas: []
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

  /**
   * Permite previsualizar los datos meteorológicos de una hora específica del carrusel
   */
  previewHour(hour: HourlyForecast) {
    if (this.selectedHour === hour) {
      // Si vuelve a hacer clic en la misma hora, deselecciona y vuelve al presente
      this.resetToLiveWeather();
    } else {
      this.selectedHour = hour;
      this.cdr.detectChanges();
    }
  }

  /**
   * Resetea la vista para mostrar los datos reales actuales de la estación
   */
  resetToLiveWeather() {
    this.selectedHour = null;
    this.cdr.detectChanges();
  }

  /**
   * Resuelve dinámicamente el outfit de Nubio según la hora seleccionada o el tiempo real
   */
  getCurrentOutfit(data: WeatherLocationData, index: number): string {
    if (index === this.activeIndex && this.selectedHour) {
      if (this.selectedHour.outfit_image_url) {
        return this.selectedHour.outfit_image_url;
      }
      // Fallback inteligente basado en la temperatura y ciclo solar del hito seleccionado
      const isDay = this.selectedHour.is_day ?? 1;
      const temp = this.selectedHour.apparent_temperature ?? this.selectedHour.temperature_2m ?? 20;

      if (isDay === 0) {
        return 'assets/characters/nubio_default.webp';
      }
      return temp > 25 ? 'assets/characters/nubio_hot.webp' : 'assets/characters/nubio_default.webp';
    }
    return data.outfit_image_url;
  }

/**
   * Resuelve dinámicamente la fecha del encabezado según el hito seleccionado o el tiempo real
   */
  getCurrentHeaderDate(data: WeatherLocationData, index: number, selectedHour: HourlyForecast | null): string {
      if (index === this.activeIndex && selectedHour && selectedHour.time) {
        const fechaIso = selectedHour.time.split('T')[0]; // Ejemplo: "2026-08-14"
        if (fechaIso) {
          const [year, month, day] = fechaIso.split('-').map(Number);
          const fechaHito = new Date(year, month - 1, day, 12, 0, 0);

          const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
          let formatted = fechaHito.toLocaleDateString('es-ES', options);
          return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        }
      }
      return this.getCustomDate(data.date);
  }

  openAlertsModal() {
    this.isAlertsModalOpen = true;
    this.cdr.detectChanges();
  }

  closeAlertsModal() {
    this.isAlertsModalOpen = false;
    this.cdr.detectChanges();
  }

}
