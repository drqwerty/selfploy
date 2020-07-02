import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-confirm-action-sheet',
  templateUrl: './delete-confirm-action-sheet.component.html',
})
export class DeleteConfirmActionSheetComponent {

  constructor(
    private modalController: ModalController,
  ) { }

  cancel() {
    this.modalController.dismiss();
  }

  accept() {
    this.modalController.dismiss(true)
  }

}
