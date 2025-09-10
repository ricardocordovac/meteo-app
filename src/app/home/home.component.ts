import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-content>
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>Meteo Valdeolmos</ion-title>
        </ion-toolbar>
      </ion-header>

      <!-- Card principal: Temperatura promedio -->
      <ion-card color="light">
        <ion-card-header>
          <ion-card-title>Temperatura Actual</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <h1>{{ averageTemp }}°C</h1>
          <p>Promedio de Valdeolmos, Algete, El Casar, Fuente el Saz</p>
        </ion-card-content>
      </ion-card>

      <!-- Cards deslizables: 4 pueblos -->
      <div class="cards-container">
        <ion-card *ngFor="let alert of alerts" [color]="alert.type === 'rain' ? 'primary' : 'light'">
          <img [src]="alert.image" alt="Pueblo" class="alert-image" />
          <ion-card-header>
            <ion-card-title>{{ alert.location }}</ion-card-title>
            <ion-card-subtitle>{{ alert.date | date:'dd/MM/yyyy HH:mm' }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>Temperatura: {{ alert.temperature_2m }}°C</p>
            <p>{{ alert.message }}</p>
            <ion-button color="primary" (click)="viewDetails(alert.location)">Ver Más</ion-button>
            <ion-button color="secondary" (click)="refreshData(alert.location)">Actualizar</ion-button>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  alerts: any[] = [];
  averageTemp: number = 0;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    try {
      const data = await this.supabaseService.getCurrentData();
      this.alerts = this.generateAlerts(data);
      this.averageTemp = this.calculateAverageTemp(data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }
generateAlerts(data: any[]) {
    const locations = ['valdeolmos', 'algete', 'el_casar', 'fuente_el_saz'];
    return locations.map((location, index) => {
      const townData = data.find(d => d.location === location) || {};
      const temperature = Number(townData.temperature_2m) || 0;
      return {
        location,
        date: townData.created_at ? new Date(townData.created_at) : new Date(),
        temperature_2m: temperature,
        message: temperature > 25 ? '¡Calor! Protégete del sol' : 'Condiciones normales',
        image: `assets/${location.toLowerCase().replace(' ', '-')}.png`,
        type: temperature > 25 ? 'temp-high' : 'normal'
      };
    });
  }

  calculateAverageTemp(data: any[]): number {
    const temps = data.map(d => Number(d.temperature_2m) || 0).filter(temp => temp !== 0);
    return temps.length ? Number((temps.reduce((sum, temp) => sum + temp, 0) / temps.length).toFixed(1)) : 0;
  }

  viewDetails(location: string) {
    console.log(`Ver detalles de ${location}`);
  }

  async refreshData(location: string) {
    console.log(`Actualizando datos de ${location}`);
    await this.loadData();
  }
}
