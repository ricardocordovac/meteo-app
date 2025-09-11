import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import {
  IonContent,
  IonSpinner
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-weather-chart',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonicModule,
    IonContent,
    IonSpinner
  ],
  templateUrl: './weather-chart.component.html',
  styleUrl: './weather-chart.component.scss'
})
export class WeatherChartComponent implements OnInit {
  data: any[] = [];
  error: string | null = null;
  loading = true;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      this.data = await this.supabaseService.getCurrentData();
    } catch (error: any) {
      this.error = error.message || 'Error loading data from Supabase';
    } finally {
      this.loading = false;
    }
  }
}
