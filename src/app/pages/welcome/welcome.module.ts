/*
  Authors: initappz (Rahul Jograna), adapted for meteo-app
  Original: DateWate Dating, licensed per https://initappz.com/license
  Copyright: © 2025-present initappz
*/
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { WelcomePage } from './welcome.page';
import { WelcomePageRoutingModule } from './welcome-routing.module';


// --- NUEVA IMPORTACIÓN PARA LOTTIE ---
import { LottieComponent } from 'ngx-lottie';
// -------------------------------------
import { WeatherWidgetPipe } from '../../pipe/weather-widget.pipe';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    WelcomePageRoutingModule,
    LottieComponent
  ],
  declarations: [WelcomePage, WeatherWidgetPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WelcomePageModule {}
