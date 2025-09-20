/*
  Authors: initappz (Rahul Jograna)
  Website: https://initappz.com/
  App Name: DateWate Dating This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2025-present initappz.
*/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CardsComponent } from './cards/cards.component';

const components = [
  CardsComponent
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    IonicModule,
  ],
  exports: components
})
export class ComponentModule {}
