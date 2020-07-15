import { Component, Input } from '@angular/core';
import { UserConfig } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';
import { ModalController, PopoverController } from '@ionic/angular';
import { RequestListOrderActionSheetComponent } from '../../action-sheets/request-list-order-action-sheet/request-list-order-action-sheet.component';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';

@Component({
  selector: 'app-request-list-popover',
  templateUrl: './request-list-popover.component.html',
  styleUrls: ['./request-list-popover.component.scss'],
})
export class RequestListPopoverComponent {

  @Input() userConfig: UserConfig;


  constructor(
    private data: DataService,
    private modalController: ModalController,
    private popoverController: PopoverController
  ) { }


  async presentModal() {
    this.popoverController.dismiss();
    const modal = await this.modalController.create({
      component: RequestListOrderActionSheetComponent,
      cssClass: 'action-sheet border-top-radius',
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
    });

    modal.present();
  }


  updateConfig() {
    this.data.updateUserConfig(this.userConfig);
  }
}
