/*
  Authors: initappz (Rahul Jograna)
  Website: https://initappz.com/
  App Name: DateWate Dating This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2025-present initappz.
*/
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, Renderer2, ViewChildren } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
// Comentar importaciones no usadas
/*
import { NavigationExtras } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { MatchFoundPage } from 'src/app/pages/match-found/match-found.page';
import { UserInfoPage } from 'src/app/pages/user-info/user-info.page';
*/

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  standalone: false
})
export class CardsComponent implements OnInit {
  @Input('cards') cards: Array<{
    image: string,
    name: string,
  }>;

  @ViewChildren('tinderCard') tinderCards: QueryList<ElementRef>;
  tinderCardsArray: Array<ElementRef>;

  @Output() choiceMade = new EventEmitter();

  moveOutWidth: number;
  shiftRequired: boolean;
  transitionInProgress: boolean;
  heartVisible: boolean;
  crossVisible: boolean;
  matchFound: boolean = false;
  haveSuperLike: boolean;

  constructor(
    private renderer: Renderer2,
    public util: UtilService
    // Comentar dependencias no usadas
    /*
    private modalController: ModalController
    */
  ) {}

  ngOnInit() {}

  userClickedButton(event: any, heart: any): boolean {
    event.preventDefault();
    if (!this.cards.length) return false;
    if (heart) {
      this.renderer.setStyle(this.tinderCardsArray[0].nativeElement, 'transform', 'translate(' + this.moveOutWidth + 'px, -100px) rotate(-30deg)');
      this.toggleChoiceIndicator(false, true);
      this.emitChoice(heart, this.cards[0]);
    } else {
      this.renderer.setStyle(this.tinderCardsArray[0].nativeElement, 'transform', 'translate(-' + this.moveOutWidth + 'px, -100px) rotate(30deg)');
      this.toggleChoiceIndicator(true, false);
      this.emitChoice(heart, this.cards[0]);
    }
    this.shiftRequired = true;
    this.transitionInProgress = true;
    return true;
  }

  toggleChoiceIndicator(cross: boolean, heart: boolean) {
    this.crossVisible = cross;
    this.heartVisible = heart;
  }

  emitChoice(heart: any, card: any) {
    this.matchFound = heart;
    this.choiceMade.emit({
      choice: heart,
      payload: card
    });
    return true;
  }

  ngAfterViewInit() {
    this.moveOutWidth = document.documentElement.clientWidth * 1.5;
    this.tinderCardsArray = this.tinderCards.toArray();
    this.tinderCards.changes.subscribe(() => {
      this.tinderCardsArray = this.tinderCards.toArray();
    });
  }

  superLike(event: any, heart: any): boolean {
    this.haveSuperLike = true;
    event.preventDefault();
    if (!this.cards.length) return false;
    if (heart) {
      this.renderer.setStyle(this.tinderCardsArray[0].nativeElement, 'transform', 'translate(' + this.moveOutWidth + 'px, -100px) rotate(-30deg)');
      this.toggleChoiceIndicator(false, true);
      this.emitChoice(heart, this.cards[0]);
    } else {
      this.renderer.setStyle(this.tinderCardsArray[0].nativeElement, 'transform', 'translate(-' + this.moveOutWidth + 'px, -100px) rotate(30deg)');
      this.toggleChoiceIndicator(true, false);
      this.emitChoice(heart, this.cards[0]);
    }
    this.shiftRequired = true;
    this.transitionInProgress = true;
    setTimeout(() => {
      this.haveSuperLike = false;
    }, 1000);
    return true;
  }

  // Comentar métodos no usados
  /*
  async openInfo(card: any) {
    console.log(card);
    const index = this.util.userList2.findIndex(x => x.name === card.name);
    const modal = await this.modalController.create({
      component: UserInfoPage,
      componentProps: { value: index }
    });
    await modal.present();
  }
  */
}
