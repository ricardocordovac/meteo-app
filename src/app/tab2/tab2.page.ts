import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { WeatherChartComponent } from '../weather-chart/weather-chart.component'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-tab2',
   standalone: true,
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
    imports: [
      IonHeader,
      IonToolbar,
      IonTitle,
      IonContent,
      WeatherChartComponent
    ],
})
export class Tab2Page {

  constructor() {}

}
