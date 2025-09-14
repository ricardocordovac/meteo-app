import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ControlTabComponent } from '../control-tab/control-tab.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [IonicModule, ControlTabComponent]
})
export class Tab3Page {
  location = 'el_casar';
}
