/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : DateWate Dating This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2025-present initappz.
*/
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicSlides } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import Swiper from 'swiper';
import { register } from 'swiper/element';

register();
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {
  @ViewChild("swiper") swiper?: ElementRef<{ swiper: Swiper }>;
  swiperModules = [IonicSlides];
  activeIndex: any = 0;
  constructor(
    public util: UtilService
  ) { }

  ngOnInit() {
  }

  onNext() {

    if (this.swiper?.nativeElement.swiper.isEnd) {
      console.log('next page');
      this.util.navigateToPage('auth');
    } else {
      this.swiper?.nativeElement.swiper.slideNext();
    }
  }

  changed() {
    this.activeIndex = this.swiper?.nativeElement.swiper.activeIndex;
  }

}
