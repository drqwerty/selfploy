import { Component } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';
import { NewReviewComponent } from '../new-review/new-review.component';
import { ModalAnimationFadeEnter } from 'src/app/animations/page-transitions';

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
    ]),
  ]
})
export class PaymentsComponent {


  paymentMade = false;
  modal: HTMLIonModalElement;


  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }


  ionViewDidEnter() {
    this.getCurrentModal();
    this.presentReviewModal();
  }


  async getCurrentModal() {
    this.modal = await this.modalController.getTop()
  }


  cancel() {
    this.modalController.dismiss();
  }


  async continue() {
    await this.presentLoading();
    setTimeout(async () => {
      await this.presentReviewModal();
      this.modal.dismiss();
    }, 200);
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 100,
    });
    await loading.present();

    await loading.onDidDismiss();
    this.paymentMade = true;
  }


  async presentReviewModal() {
    const modal = await this.modalController.create({
      component: NewReviewComponent,
      enterAnimation: ModalAnimationFadeEnter
    });

    await modal.present();
  }

}
