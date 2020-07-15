import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {

  @Input() infoList: string;

  constructor(
    private modalController: ModalController,
  ) { }


  dismiss() {
    this.modalController.dismiss();
  }

}
