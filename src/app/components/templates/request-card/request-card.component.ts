import { Component, Input, AfterViewInit } from '@angular/core';
import { Request, RequestStatus, RequestStatusText } from 'src/app/models/request-model';
import { ModalController } from '@ionic/angular';
import { RequestCardActionSheetComponent } from 'src/app/components/action-sheets/request-card-action-sheet/request-card-action-sheet.component';
import { DeleteConfirmActionSheetComponent } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.component';
import { DataService } from 'src/app/providers/data.service';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';
import { RequestNewComponent } from 'src/app/components/modals/as-pages/request-new/request-new.component';

@Component({
  selector: 'request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements AfterViewInit {

  @Input() request: Request;


  requestStatusText = RequestStatusText;
  showSpinner = true;

  constructor(
    private modalController: ModalController,
    private data: DataService,
  ) { }

  ngAfterViewInit() {
    console.log(this.request);
  }

  imageLoaded() {
    this.showSpinner = false;
  }

  async presentOptions() {
    const modal = await this.modalController.create({
      component: RequestCardActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        isDraft: this.request.status == RequestStatus.draft,
        isMine: this.request.isMine,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {

        switch (data) {
          case RequestStatus.closed:
          case RequestStatus.completed:
            break;

          case RequestStatus.edit:
            this.editRequest();

            break;
          case RequestStatus.delete:
            this.deleteRequest();

            break;

          default:
            break;
        }

      }
    })

    modal.present();
  }

  async editRequest() {
    const modal = await this.modalController.create({
      component: RequestNewComponent,
      componentProps: {
        edit: true,
        request: this.request,
        images: this.request.images,
      }
    });

    modal.present();
  }

  async deleteRequest() {
    const modal = await this.modalController.create({
      component: DeleteConfirmActionSheetComponent,
      cssClass: 'modal',
    });

    modal.onDidDismiss().then(({ data: confirm }) => {
      if (confirm) this.data.removeRequest(this.request);
    });

    modal.present();
  }

  onClick() {
  }

}
