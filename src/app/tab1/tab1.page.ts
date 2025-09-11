// import { Component, OnInit  } from '@angular/core';
// import { IonicModule, IonIcon } from '@ionic/angular';
// import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
// import { WeatherChartComponent } from '../weather-chart/weather-chart.component'; // Ajusta la ruta si es necesario

// @Component({
//   selector: 'app-tab1',
//    standalone: true,
//   templateUrl: 'tab1.page.html',
//   styleUrls: ['tab1.page.scss'],
//   imports: [
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonContent,
//     IonicModule,
//     WeatherChartComponent
//   ],

// })
// export class Tab1Page {
//   constructor() {}
// }

import { Component, OnInit  } from '@angular/core';
import { IonicModule, IonIcon } from '@ionic/angular';

import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { addIcons } from 'ionicons';
import { sunny, cloud, rainy, snow } from 'ionicons/icons';



@Component({
  selector: 'app-tab1',
  standalone: true,
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonicModule, CommonModule, DatePipe],
})
export class Tab1Page implements OnInit {
  data: any[] = [];
  error: string | null = null;
  loading = true;

  constructor(private supabaseService: SupabaseService) {
    addIcons({ sunny, cloud, rainy, snow });
  }

  async ngOnInit() {
    try {
      this.data = await this.supabaseService.getDataByLocation('valdeolmos');
    } catch (error: any) {
      this.error = error.message || 'Error loading data';
    } finally {
      this.loading = false;
    }
  }

  getWeatherIcon(temp: number): string {
    if (temp > 25) return 'sunny';
    if (temp > 15) return 'cloud';
    if (temp > 5) return 'rainy';
    return 'snow';
  }
}
