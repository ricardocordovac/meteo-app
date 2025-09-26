import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SupabaseService } from 'src/app/services/supabase.service';
import { UtilService } from 'src/app/services/util.service';
import SwiperCore from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

SwiperCore.use([Navigation, Pagination]);

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
   // this.loadWeatherData();
   setTimeout(() => {
      this.loader = true;
      this.loadWeatherData();
    }, 1000);
  }

  ngAfterViewInit() {
    // No inicializar Swiper aquí, esperar a que loader sea true
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
          createdAt.setHours(createdAt.getHours() + 2); // Sumar 2 horas para Madrid (CEST)
          }
          const timestamp = item.timestamp ? new Date(item.timestamp) : null;
          if (timestamp instanceof Date && timestamp.toString() !== 'Invalid Date') {
          timestamp.setHours(timestamp.getHours() + 2); // Sumar 2 horas para Madrid (CEST)
          }
          const result = {
            location: String(item.location || location || 'N/A'),
            temp: item.temperature_2m != null ? Number(item.temperature_2m).toFixed(1) : 'N/A',
            rain: item.precipitation != null ? Number(item.precipitation).toFixed(1) : '0.0',
            date: createdAt instanceof Date && createdAt.toString() !== 'Invalid Date' ? createdAt.toLocaleDateString() : 'N/A',
            time: timestamp instanceof Date && timestamp.toString() !== 'Invalid Date' ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            background: this.mapWeatherToBackground(item)
          };
          console.log('Processed item for', location, ':', result);
          console.log('Background URL:', `/assets/backgrounds/${result.background}`);
          return result;
        })
      );
      if (this.weatherData.length === 0) {
        console.warn('No weather data loaded, using fallback');
        this.weatherData = locations.map(location => ({
          location: String(location),
          temp: 'N/A',
          rain: '0.0',
          date: 'N/A',
          time: 'N/A',
          background: 'soleado.png'
        }));
      }
      this.loader = true;
      this.cdr.detectChanges(); // Forzar detección de cambios
      setTimeout(() => {
        this.initializeSwiper();
      }, 1000); // Aumentar timeout para asegurar que el DOM esté listo
    } catch (error) {
      console.error('Error loading weather data:', error);
      this.loader = true;
      this.weatherData = locations.map(location => ({
        location: String(location),
        temp: 'N/A',
        rain: '0.0',
        date: 'N/A',
        time: 'N/A',
        background: 'soleado.png'
      }));
      this.cdr.detectChanges();
      setTimeout(() => {
        this.initializeSwiper();
      }, 1000);
    }
  }


  mapWeatherToBackground(item: any): string {
  const weathercode = Number(item.weathercode ?? -1);
  const isDay = Number(item.is_day ?? 1);
  const cloudcover = Number(item.cloudcover ?? 0);
  const temperature = Number(item.temperature_2m ?? 0);
  const precipitation = Number(item.precipitation ?? 0);
  const windSpeed = Number(item.wind_speed_10m ?? 0);
  const visibility = Number(item.visibility ?? 100000); // en metros

  // Tormenta
  if ([95, 96, 99].includes(weathercode)) return 'tormenta_thunder.png';

  // Lluvia
  if ([61, 63, 65, 80, 81, 82].includes(weathercode)) return 'lluvia_rain.png';

  // Llovizna
  if ([51, 53, 55].includes(weathercode)) return 'llovisnaDrizzle.png';

  // Nieve
  if ([71, 73, 75, 77, 85, 86].includes(weathercode)) return 'helada_escarcha.png';

  // Escarcha sin precipitación
  if (temperature <= 0 && precipitation === 0 && [0, 1, 2, 3].includes(weathercode)) return 'helada_escarcha2.png';

  // Niebla
  if ([45, 48].includes(weathercode) || visibility < 1000) return 'nieblafog.png';

  // Bruma / Calima
  if ([0, 1, 2].includes(weathercode) && temperature > 25 && cloudcover < 30 && windSpeed < 10) return 'bruma_calima.png';

  // Viento fuerte
  if (windSpeed > 30) return 'vientofuerte.png';

  // Noche despejada
  if (weathercode === 0 && isDay === 0) return 'nochedespejada.png';

  // Noche nublada
  if ((weathercode === 3 || weathercode >= 61) && isDay === 0) return 'nublado_cloudy.png';

  // Despejado
  if (weathercode === 0 && isDay === 1) return 'despejado_clear.png';

  // Soleado
  if ((weathercode === 1 || weathercode === 2) && cloudcover < 50 && isDay === 1) return 'soleado_sunny.png';

  // Parcialmente nublado
  if (weathercode === 2 && cloudcover >= 50 && isDay === 1) return 'parcialmentenublado.png';

  // Nublado uno

  if (weathercode === 3 && isDay === 1) return 'nublado_cloudy.png';

  // Fallback
  return 'eliminar.png';
}


  // mapWeatherToBackground(item: any): string {
  //   const precipitation = Number(item.precipitation || 0);
  //   const windSpeed = Number(item.wind_speed_10m || 0);
  //   const humidity = Number(item.relative_humidity_2m || 0);
  //   if (windSpeed > 15) return 'vientofuerte.png';
  //   if (humidity > 80) return 'niebla.png';
  //   if (precipitation > 20) return 'tormenta.png';
  //   if (precipitation > 10) return 'lluvia.png';
  //   if (precipitation > 5) return 'parcialnublado.png';
  //   if (precipitation > 2) return 'nublado.png';
  //   return 'soleado.png';
  // }

  ngOnDestroy() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      console.log('Swiper instance destroyed');
    }
  }
}
