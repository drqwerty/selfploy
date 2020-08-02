import { Component, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { NewReviewComponent } from '../new-review/new-review.component';
import { ModalAnimationFadeEnter } from 'src/app/animations/page-transitions';
import { User } from 'src/app/models/user-model';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss'],
  animations: [
    trigger('element', [
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate("0.25s ease-in", style({ transform: 'translateY(-20px)', opacity: 0, })),
      ]),
    ]),
    trigger('elementReverse', [
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate("0.25s ease-in", style({ transform: 'translateY(20px)', opacity: 0, })),
      ])
    ]),
    trigger('elementPayment', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-out', keyframes([
          style({ transform: 'translateY(-20px)', opacity: 0, offset: 0.75 }),
          style({ transform: 'translateY(0)', opacity: 1, offset: 1 })
        ])),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('1s ease-in', keyframes([
          style({ transform: 'translateY(0)', opacity: 1, offset: 0.75 }),
          style({ transform: 'translateY(20px)', opacity: 0, offset: 1 })
        ])),
      ]),
    ]),
  ]
})
export class PaymentsComponent {


  @Input() professional: User;


  paymentMade         = false;
  showPaymentComplete = false;
  modal: HTMLIonModalElement;


  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }


  ionViewDidEnter() {
    this.getCurrentModal();
  }


  async getCurrentModal() {
    this.modal = await this.modalController.getTop()
  }


  cancel() {
    this.modalController.dismiss();
  }


  async continue() {
    await this.presentLoading();
    setTimeout(() => this.showPaymentComplete = false, 1000);
    setTimeout(async () => {
      await this.presentReviewModal();
      // this.modal.dismiss(true);
      this.modal.dismiss();
    }, 2000);
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 1000,
    });
    await loading.present();

    await loading.onDidDismiss();
    this.paymentMade = true;
    this.showPaymentComplete = true;
  }


  async presentReviewModal() {
    const modal = await this.modalController.create({
      enterAnimation: ModalAnimationFadeEnter,
      component: NewReviewComponent,
      componentProps: {
        professional: this.professional,
      },
    });

    await modal.present();
  }

}
