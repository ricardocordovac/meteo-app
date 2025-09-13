import { Component, OnInit  } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent,IonSpinner,IonIcon, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { sunny, cloud, rainy, snow } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [IonHeader,
            IonToolbar,
            IonTitle,
            IonContent,
            IonSpinner,
            IonIcon,
            IonCard,
            IonCardHeader,
            IonCardTitle,
            IonCardContent,
            ExploreContainerComponent,
            CommonModule,
            DatePipe],
})
export class Tab1Page implements OnInit  {
  data: any[] = [];
  dataf: any[] = [];
  error: string | null = null;
  loading = true;

  constructor(private supabaseService: SupabaseService) {
    addIcons({ sunny, cloud, rainy, snow });
  }

  async ngOnInit() {
    try {
      const [currentData, forecastData] = await Promise.all([
        this.supabaseService.getDataByLocation('valdeolmos'),
        this.supabaseService.getDataByLocationForecast('valdeolmos')
      ]);
      this.data = currentData;
      this.dataf = forecastData;
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
