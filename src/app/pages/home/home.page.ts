/*
  Authors: initappz (Rahul Jograna)
  Website: https://initappz.com/
  App Name: DateWate Dating This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2025-present initappz.
*/
import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { MeteoroService } from 'src/app/services/meteo.service';
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
  backgroundStyle: any = {};  // ← NUEVO: estilo fondo dinámico

  constructor(
    public util: UtilService,
    private meteoService: MeteoroService  // ← AÑADIDO
  ) {
    // this.loader = false;
    // setTimeout(() => {
    //   this.loader = true;
    //   this.cards = [
    //     { image: 'assets/backgrounds/valdeolmos.jpg', name: 'Valdeolmos' },
    //     { image: 'assets/backgrounds/algete.jpg', name: 'Algete' },
    //     { image: 'assets/backgrounds/el_casar.jpg', name: 'El Casar' },
    //     { image: 'assets/backgrounds/fuente_el_saz.jpg', name: 'Fuente el Saz' }
    //   ];
    // }, 2000);
  }

async ngOnInit() {
    this.loader = false;

// === FONDO DINÁMICO DESDE SUPABASE ===
    try {
      const current = await this.meteoService.getCurrentWeather('valdeolmos');  // Cambia pueblo si quieres
      if (current && current.background_image_url) {
        const fileName = current.background_image_url.split('/').pop();  // Extrae nombre .webp
        this.backgroundStyle = {
          'background-image': `url(/assets/backgrounds/${fileName})`,
          'background-size': 'cover',
          'background-position': 'center',
          'background-repeat': 'no-repeat'
        };
      } else {
        // Fallback
        this.backgroundStyle = {
          'background-image': 'url(/assets/backgrounds/CyN_TmF_PrS_ViB_VsE_all.webp)',
          'background-size': 'cover',
          'background-position': 'center'
        };
      }
    } catch (error) {
      console.error('Error cargando fondo:', error);
      this.backgroundStyle = { 'background-color': '#111' };  // Negro temporal
    }

// === CARDS ESTÁTICAS (tu código original) ===
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
}
