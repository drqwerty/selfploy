import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-request-new-action-sheet',
  templateUrl: './request-new-action-sheet.component.html',
  styleUrls: ['./request-new-action-sheet.component.scss'],
})
export class RequestNewActionSheetComponent {

  @Input() requestIsComplete = false;


  constructor(
    private modalController: ModalController,
  ) { }


  dismiss(option) {
    this.modalController.dismiss(option);
  }


}
