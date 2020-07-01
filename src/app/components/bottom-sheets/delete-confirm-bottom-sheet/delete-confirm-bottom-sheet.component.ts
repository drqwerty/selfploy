import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-confirm-bottom-sheet',
  templateUrl: './delete-confirm-bottom-sheet.component.html',
  styleUrls: ['./delete-confirm-bottom-sheet.component.scss'],
})
export class DeleteConfirmBottomSheetComponent {

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
