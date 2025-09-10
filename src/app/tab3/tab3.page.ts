import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { WeatherChartComponent } from '../weather-chart/weather-chart.component'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-tab3',
   standalone: true,
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
    imports: [
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      WeatherChartComponent
    ],
})
export class Tab3Page {
  constructor() {}
}
