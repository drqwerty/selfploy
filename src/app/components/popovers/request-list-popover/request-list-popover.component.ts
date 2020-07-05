import { Component } from '@angular/core';
import { UserConfig } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';
import { RequestListConfig } from 'src/app/models/request-model';
import { ModalController, PopoverController } from '@ionic/angular';
import { RequestListOrderActionSheetComponent } from '../../action-sheets/request-list-order-action-sheet/request-list-order-action-sheet.component';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';

@Component({
  selector: 'app-request-list-popover',
  templateUrl: './request-list-popover.component.html',
  styleUrls: ['./request-list-popover.component.scss'],
})
export class RequestListPopoverComponent {

  userConfig: UserConfig;

  constructor(
    private data: DataService,
    private modalController: ModalController,
    private popoverController: PopoverController
  ) {
    this.init();
  }

  async init() {
    this.userConfig = await this.data.getUserConfig();
    this.presentModal();
  }


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

  async updateConfig() {
    await this.data.updateUserConfig(this.userConfig);
  }
}
