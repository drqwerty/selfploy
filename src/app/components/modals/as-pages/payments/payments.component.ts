import { Component } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

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


  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }


  cancel() {
    this.modalController.dismiss();
  }


  continue() {
    this.presentLoading();
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      duration: 1000,
    });
    await loading.present();

    await loading.onDidDismiss();
    this.paymentMade = true;
  }

}
