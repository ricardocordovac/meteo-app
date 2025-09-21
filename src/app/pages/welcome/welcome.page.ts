/*
  Authors: initappz (Rahul Jograna), adapted for meteo-app
  Original: DateWate Dating, licensed per https://initappz.com/license
  Copyright: © 2025-present initappz
*/
import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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

  constructor(
    public util: UtilService,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {
    this.loadWeatherData();
  }

ngAfterViewInit() {
    if (this.swiper?.nativeElement) {
      const swiperInstance = new SwiperCore(this.swiper.nativeElement, {
        slidesPerView: 1,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        observeParents: true,
        observer: true,
        speed: 400,
        spaceBetween: 0
      });
      console.log('Swiper initialized:', swiperInstance);
      swiperInstance.on('slideChange', () => {
        this.activeIndex = swiperInstance.activeIndex;
        console.log('Swiper slide changed, activeIndex:', this.activeIndex);
      });
    }
  }

  async loadWeatherData() {
    try {
      this.loader = false;
      const locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
      this.weatherData = await Promise.all(
        locations.map(async location => {
         const data = await this.supabase.getDataByLocation(location);
        const item = data[0] || {};
        console.log('Supabase data for', location, ':', item); // Log para depuración
          const createdAt = item.created_at ? new Date(item.created_at) : null;
          const timestamp = item.timestamp ? new Date(item.timestamp) : null;
          const result = {
            location: String(item.location || location || 'N/A'), // Asegurar string
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
      setTimeout(() => {
        if (this.swiper?.nativeElement) {
          const swiperInstance = (this.swiper.nativeElement as any).swiper;
          if (swiperInstance) {
            swiperInstance.update();
            console.log('Swiper updated after data load');
          }
        }
      }, 500);
    } catch (error) {
      console.error('Error loading weather data:', error);
         const locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
      this.loader = true;
      this.weatherData = locations.map(location => ({
        location: String(location),
        temp: 'N/A',
        rain: '0.0',
        date: 'N/A',
        time: 'N/A',
        background: 'soleado.png'
      }));
    }
  }

  mapWeatherToBackground(item: any): string {
    const precipitation = Number(item.precipitation || 0);
    const windSpeed = Number(item.wind_speed_10m || 0);
    const humidity = Number(item.relative_humidity_2m || 0);
    if (windSpeed > 15) return 'vientofuerte.png';
    if (humidity > 80) return 'niebla.png';
    if (precipitation > 20) return 'tormenta.png';
    if (precipitation > 10) return 'lluvia.png';
    if (precipitation > 5) return 'parcialnublado.png';
    if (precipitation > 2) return 'nublado.png';
    return 'soleado.png';
  }
}


// import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { SupabaseService } from 'src/app/services/supabase.service';
// import { UtilService } from 'src/app/services/util.service';
// import SwiperCore from 'swiper';
// import { Navigation, Pagination } from 'swiper/modules'; // Importar desde swiper/modules

// SwiperCore.use([Navigation, Pagination]);

// @Component({
//   selector: 'app-welcome',
//   templateUrl: './welcome.page.html',
//   styleUrls: ['./welcome.page.scss'],
//   standalone: false,
// })
// export class WelcomePage implements OnInit, AfterViewInit {
//   @ViewChild('swiper', { static: false }) swiper?: ElementRef<HTMLElement>;
//   activeIndex: number = 0;
//   loader: boolean = false;
//   weatherData: any[] = [];

//   constructor(
//     public util: UtilService,
//     private supabase: SupabaseService
//   ) {
//     setTimeout(() => {
//       this.loader = true;
//       this.loadWeatherData();
//     }, 2000);
//   }

//   ngOnInit() {}

//   ngAfterViewInit() {
//     if (this.swiper?.nativeElement) {
//       new SwiperCore(this.swiper.nativeElement, {
//         slidesPerView: 1,
//         navigation: true,
//         pagination: false
//       });
//       console.log('Swiper initialized:', this.swiper.nativeElement);
//     }
//   }



//   async loadWeatherData() {
//     const locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
//     this.weatherData = await Promise.all(
//       locations.map(async (location) => {
//         const data = await this.supabase.getDataByLocation(location);
//         const item = data[0] || {};
//         console.log('Supabase data for', location, ':', item); // Log para depuración
//         const createdAt = item.created_at ? new Date(item.created_at) : null;
//         const timestamp = item.timestamp ? new Date(item.timestamp) : null;
//         const result = {
//           location: item.location || location || 'N/A',
//           temp: item.temperature_2m != null ? item.temperature_2m.toFixed(1) : 'N/A',
//           rain: item.precipitation != null ? item.precipitation.toFixed(1) : '0.0',
//           date: createdAt instanceof Date && createdAt.toString() !== 'Invalid Date' ? createdAt.toLocaleDateString() : 'N/A',
//           time: timestamp instanceof Date && timestamp.toString() !== 'Invalid Date' ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
//           background: this.mapWeatherToBackground(item)
//         };
//         console.log('Processed item for', location, ':', result); // Log para depuración
//         console.log('Background URL:', `assets/backgrounds/${result.background}`); // Log para fondo
//         return result;
//       })
//     );
//     console.log('Processed weatherData:', this.weatherData); // Log para depuración
//     if (this.weatherData.length === 0) {
//       console.warn('No weather data loaded, using fallback');
//       this.weatherData = locations.map(location => ({
//         location,
//         temp: 'N/A',
//         rain: '0.0',
//         date: 'N/A',
//         time: 'N/A',
//         background: 'soleado.png'
//       }));
//     }
// setTimeout(() => {
//       if (this.swiper?.nativeElement) {
//         const swiperInstance = (this.swiper.nativeElement as any).swiper;
//         if (swiperInstance) {
//           swiperInstance.update();
//           console.log('Swiper updated after data load');
//         }
//       }
//     }, 100);
//   }

//   mapWeatherToBackground(item: any): string {
//     const precipitation = item.precipitation || 0;
//     const windSpeed = item.wind_speed_10m || 0;
//     const humidity = item.relative_humidity_2m || 0;

//     if (windSpeed > 15) return 'vientofuerte.png';
//     if (humidity > 80) return 'niebla.png';
//     if (precipitation > 20) return 'tormenta.png';
//     if (precipitation > 10) return 'lluvia.png';
//     if (precipitation > 5) return 'parcialnublado.png';
//     if (precipitation > 2) return 'nublado.png';
//     return 'soleado.png';
//   }

// changed() {
//     if (this.swiper?.nativeElement) {
//       this.activeIndex = (this.swiper.nativeElement as any).swiper?.activeIndex || 0;
//       console.log('Swiper slide changed, activeIndex:', this.activeIndex);
//     }
//   }
// }
