import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';



@Component({
  selector: 'app-control-tab',
  templateUrl: './control-tab.component.html',
  styleUrls: ['./control-tab.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  encapsulation: ViewEncapsulation.None
})
export class ControlTabComponent implements OnInit {
  @Input() location: string = '';
  currentData: any[] = [];
  forecastData: any[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    if (!this.location) {
      this.error = 'No location provided';
      return;
    }
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    this.error = null;
    try {
      this.currentData = await this.supabaseService.getDataByLocation(this.location);
      this.forecastData = await this.supabaseService.getDataByLocationForecast(this.location);
      if (this.currentData.length === 0) {
        this.error = `No current data found for ${this.location}`;
      }
      if (this.forecastData.length === 0) {
        this.error = this.error ? `${this.error}; No forecast data found for ${this.location}` : `No forecast data found for ${this.location}`;
      }
    } catch (err: any) {
      this.error = `Error fetching data for ${this.location}: ${err.message}`;
    } finally {
      this.isLoading = false;
    }
  }
}
