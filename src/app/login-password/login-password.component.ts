import { Component, ViewChild } from '@angular/core';
import { ModalController, IonToolbar } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.component.html',
  styleUrls: ['./login-password.component.scss'],
})
export class LoginPasswordComponent {

  @ViewChild(IonToolbar, { static: false }) ionToolbar: any;

  toolbarAnimation: Animation;

  constructor(
    private modalController: ModalController,
  ) { }


  goBack() {

    this.modalController.dismiss();
  }


  ionViewWillEnter() {

    this.toolbarAnimation = this.createToolbarAnimation();
    this.toolbarAnimation
      .delay(200)
      .play();
  }


  ionViewWillLeave() {

    this.toolbarAnimation
      .delay(0)
      .direction('reverse')
      .play();
  }


  createToolbarAnimation() {

    return createAnimation()
      .addElement(this.ionToolbar.el)
      .fromTo('opacity', '0', '1');
  }

}
