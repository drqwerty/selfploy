import { Component, Input, AfterViewInit, OnInit } from '@angular/core';
import { Request, RequestStatus, RequestStatusText } from 'src/app/models/request-model';
import { ModalController, ToastController } from '@ionic/angular';
import { RequestCardActionSheetComponent } from 'src/app/components/action-sheets/request-card-action-sheet/request-card-action-sheet.component';
import { DeleteConfirmActionSheetComponent } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.component';
import { DataService } from 'src/app/providers/data.service';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';
import { RequestNewComponent } from 'src/app/components/modals/as-pages/request-new/request-new.component';
import { RequestInfoComponent } from '../../modals/as-pages/request-info/request-info.component';
import { ConversationComponent } from '../../modals/as-pages/conversation/conversation.component';
import { ModalAnimationSlideWithOpacityEnter, ModalAnimationSlideWithOpacityLeave } from 'src/app/animations/page-transitions';
import { PaymentsComponent } from '../../modals/as-pages/payments/payments.component';
import { ToastAnimationEnter, ToastAnimationLeave } from 'src/app/animations/toast-transitions';
import { User } from 'src/app/models/user-model';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
const { StatusBar } = Plugins;

@UntilDestroy()
@Component({
  selector: 'request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;


  requestStatus = RequestStatus;
  requestStatusText = RequestStatusText;
  showSpinner = true;
  contactsCount = 0;

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
    private toastController: ToastController,
  ) { }


  ngOnInit() {
    this.updateContactsCount();
    this.dataService.newMessageSubject
      .pipe(untilDestroyed(this))
      .subscribe(() => this.updateContactsCount());
   }


  imageLoaded() {
    this.showSpinner = false;
  }


  async openConversation(event: MouseEvent) {
    event.stopPropagation();

    const modal = await this.modalController.create({
      component: ConversationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityLeave,
      componentProps: {
        requestId: this.request.id,
        partnerId: this.request.owner
      },
    });

    modal.onWillDismiss().then(() => modal.classList.remove('background-black'));
    modal.present().then(() => modal.classList.add('background-black'));
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
        if (confirm) this.dataService.closeRequest(this.request);
      });
  }


  async completeRequest() {
    const professional = this.dataService.getFirstUserOfRequestConversations(this.request.id);

    if (professional) {
      (await this.showConfirmAction('Continuar'))
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) this.presentPaymentModal(professional);
      });

    } else {
      this.presentNotPaymentAvailableToast();
    }
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
        if (confirm) this.dataService.removeRequest(this.request);
      });
  }


  async presentPaymentModal(professional: User) {
    const modal = await this.modalController.create({
      component: PaymentsComponent,
      componentProps: { professional },
    });
    
    modal.onDidDismiss().then(({ data }) => {
      if (data !== undefined) this.dataService.completeRequest(this.request, professional.id);
    });
    
    modal.present();
  }


  async presentNotPaymentAvailableToast() {
    const toast = await this.toastController.create({
      message: 'No hay facturas disponibles',
      duration: 2000,
      mode: 'ios',
      cssClass: 'login-toast',
      enterAnimation: ToastAnimationEnter,
      leaveAnimation: ToastAnimationLeave,
    });
    toast.present();
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

    let currentStatusBarStyle: StatusBarStyle;
    if (Capacitor.isPluginAvailable('StatusBar')) currentStatusBarStyle = (await StatusBar.getInfo()).style;
    
    modal.onWillDismiss().then(() => { 
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: currentStatusBarStyle })
      modal.classList.remove('background-black');
    });

    modal.present().then(() =>       { 
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark })
      modal.classList.add('background-black');
    });
  }


  existUnreadedMessages() {
    const conversations = this.dataService.getConversationFromRequest(this.request.id);
    return conversations.some(conversation => Object.values(conversation.messages).some(({ fromMe, readed }) => !fromMe && !readed));
  }
  
  
  updateContactsCount() {
    this.contactsCount = this.dataService.getConversationFromRequest(this.request.id).length;
  }
}
