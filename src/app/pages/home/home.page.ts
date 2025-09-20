/*
  Authors: initappz (Rahul Jograna)
  Website: https://initappz.com/
  App Name: DateWate Dating This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2025-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
// Comentar importación no usada
/*
import { ModalController } from '@ionic/angular';
import { FilterPage } from '../filter/filter.page';
*/

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  cards: any[] = [];
  loader: boolean = false;

  constructor(public util: UtilService) {
    this.loader = false;
    setTimeout(() => {
      this.loader = true;
      this.cards = [
        { image: 'assets/backgrounds/valdeolmos.jpg', name: 'Valdeolmos' },
        { image: 'assets/backgrounds/algete.jpg', name: 'Algete' },
        { image: 'assets/backgrounds/el_casar.jpg', name: 'El Casar' },
        { image: 'assets/backgrounds/fuente_el_saz.jpg', name: 'Fuente el Saz' }
      ];
    }, 2000);
  }

  ngOnInit() {}
}
