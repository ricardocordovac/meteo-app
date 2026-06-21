/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : DateWate Dating This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2025-present initappz.
*/
import { NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';


@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,  IonicModule.forRoot(), AppRoutingModule, HammerModule,],
  providers: [provideHttpClient(),    provideLottieOptions({
      player: () => player,
    }),
     { provide: RouteReuseStrategy,
       useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
