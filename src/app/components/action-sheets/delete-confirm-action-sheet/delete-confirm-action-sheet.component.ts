import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-delete-confirm-action-sheet',
  templateUrl: './delete-confirm-action-sheet.component.html',
})
export class DeleteConfirmActionSheetComponent {

  @Input() text = 'Eliminar';

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
