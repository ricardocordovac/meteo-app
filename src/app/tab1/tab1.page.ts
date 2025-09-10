import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { ExploreContainerComponent } from '../explore-container/explore-container.component';
import { WeatherChartComponent } from '../weather-chart/weather-chart.component'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-tab1',
   standalone: true,
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    WeatherChartComponent
  ],

})
export class Tab1Page {
  constructor() {}
}
