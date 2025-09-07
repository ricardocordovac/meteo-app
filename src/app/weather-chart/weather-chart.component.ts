import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-weather-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather-chart.component.html',
  styleUrl: './weather-chart.component.scss'
})
export class WeatherChartComponent implements OnInit {
  data: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      this.data = await this.supabaseService.getCurrentData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
}
