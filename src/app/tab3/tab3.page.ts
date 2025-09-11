import { Component, OnInit  } from '@angular/core';
import { IonicModule, IonIcon } from '@ionic/angular';

import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { addIcons } from 'ionicons';
import { sunny, cloud, rainy, snow } from 'ionicons/icons';


@Component({
  selector: 'app-tab3',
  standalone: true,
  imports: [IonicModule, CommonModule, DatePipe],
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss']
})
export class Tab3Page implements OnInit {
  data: any[] = [];
  error: string | null = null;
  loading = true;

  constructor(private supabaseService: SupabaseService) {
    addIcons({ sunny, cloud, rainy, snow });
  }

  async ngOnInit() {
    try {
      this.data = await this.supabaseService.getDataByLocation('el_casar');
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
