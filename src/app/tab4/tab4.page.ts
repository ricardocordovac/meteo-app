import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ControlTabComponent } from '../control-tab/control-tab.component';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [IonicModule, ControlTabComponent]
})
export class Tab4Page {
  location = 'fuente_el_saz';
}
