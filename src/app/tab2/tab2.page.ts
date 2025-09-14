import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ControlTabComponent } from '../control-tab/control-tab.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, ControlTabComponent]
})
export class Tab2Page {
  location = 'algete';
}

// import { Component, OnInit  } from '@angular/core';
// import { IonHeader, IonToolbar, IonTitle, IonContent,IonSpinner,IonIcon } from '@ionic/angular/standalone';
// import { ExploreContainerComponent } from '../explore-container/explore-container.component';
// import { CommonModule, DatePipe } from '@angular/common';
// import { SupabaseService } from '../services/supabase.service';
// import { sunny, cloud, rainy, snow } from 'ionicons/icons';
// import { addIcons } from 'ionicons';
// @Component({
//   selector: 'app-tab2',
//   templateUrl: 'tab2.page.html',
//   styleUrls: ['tab2.page.scss'],
//   imports: [IonHeader,
//             IonToolbar,
//             IonTitle,
//             IonContent,
//             IonSpinner,
//             IonIcon,
//             CommonModule,
//             DatePipe],
// })
// export class Tab2Page implements OnInit  {
//   data: any[] = [];
//   dataf: any[] = [];
//   error: string | null = null;
//   loading = true;

//   constructor(private supabaseService: SupabaseService) {
//     addIcons({ sunny, cloud, rainy, snow });
//   }

//   async ngOnInit() {
//        try {
//       const [currentData, forecastData] = await Promise.all([
//         this.supabaseService.getDataByLocation('valdeolmos'),
//         this.supabaseService.getDataByLocationForecast('valdeolmos')
//       ]);
//       this.data = currentData;
//       this.dataf = forecastData;
//     } catch (error: any) {
//       this.error = error.message || 'Error loading data';
//     } finally {
//       this.loading = false;
//     }
//   }

//   getWeatherIcon(temp: number): string {
//     if (temp > 25) return 'sunny';
//     if (temp > 15) return 'cloud';
//     if (temp > 5) return 'rainy';
//     return 'snow';
//   }

// }
