import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ControlTabComponent } from '../control-tab/control-tab.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, ControlTabComponent]
})
export class Tab1Page {
  location = 'valdeolmos';
}
