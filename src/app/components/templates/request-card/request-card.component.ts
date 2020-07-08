import { Component, Input, AfterViewInit } from '@angular/core';
import { Request, RequestStatus, RequestStatusText } from 'src/app/models/request-model';
import { ModalController } from '@ionic/angular';
import { RequestCardActionSheetComponent } from 'src/app/components/action-sheets/request-card-action-sheet/request-card-action-sheet.component';
import { DeleteConfirmActionSheetComponent } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.component';
import { DataService } from 'src/app/providers/data.service';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';
import { RequestNewComponent } from 'src/app/components/modals/as-pages/request-new/request-new.component';
import { RequestInfoComponent } from '../../modals/as-pages/request-info/request-info.component';

@Component({
  selector: 'request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements AfterViewInit {

  @Input() request: Request;


  requestStatus = RequestStatus;
  requestStatusText = RequestStatusText;
  showSpinner = true;

  constructor(
    private modalController: ModalController,
    private data: DataService,
  ) { }

  ngAfterViewInit() {
    // console.log(this.request);
  }

  imageLoaded() {
    this.showSpinner = false;
  }

  async presentOptions(event: MouseEvent) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: RequestCardActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        status: this.request.status,
        isMine: this.request.isMine,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {

        switch (data) {
          case RequestStatus.closed:
            this.closeRequest();
            break;

          case RequestStatus.completed:
            this.completeRequest();
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

  async closeRequest() {
    (await this.showConfirmAction('Continuar'))
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) this.data.closeRequest(this.request);
      });
  }

  async completeRequest() {
    (await this.showConfirmAction('Continuar'))
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) this.data.completeRequest(this.request);
      });
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

    modal.onWillDismiss().then(() => modal.classList.remove('background-black'));
    modal.present().then(() => modal.classList.add('background-black'));
  }

  async deleteRequest() {
    (await this.showConfirmAction())
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) this.data.removeRequest(this.request);
      });
  }

  async showConfirmAction(confirmText?: string) {
    let componentProps = confirmText ? { text: confirmText } : {};
    const modal = await this.modalController.create({
      component: DeleteConfirmActionSheetComponent,
      cssClass: 'modal',
      componentProps,
    });
    modal.present();
    return modal;
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: RequestInfoComponent,
      componentProps: { request: this.request }
    });

    await modal.present();
  }

}
