import { Component, ViewChild } from '@angular/core';
import { ModalController, IonToolbar, IonInput } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration } from '../animations/page-transitions';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.component.html',
  styleUrls: ['./login-password.component.scss'],
})
export class LoginPasswordComponent {

  @ViewChild(IonToolbar, { static: false }) ionToolbar: any;
  @ViewChild('passwordInput', { static: false }) passwordInput: IonInput;

  toolbarAnimation: Animation;
  passwordInputType: 'password' | 'text' = 'password';
  passwordInputIcon: 'eye' | 'eye-off' = 'eye';


  constructor(
    private modalController: ModalController,
  ) { }


  goBack() {

    this.modalController.dismiss();
  }


  togglePasswordMode() {

    if (this.passwordInputType == 'text') {
      this.passwordInputType = 'password';
      this.passwordInputIcon = 'eye'

    } else {
      this.passwordInputType = 'text';
      this.passwordInputIcon = 'eye-off'
    }

    this.passwordInput.getInputElement()
      .then(inputElement => {
        const selectionStart = inputElement.selectionStart;
        this.passwordInput.setFocus();
        setTimeout(() => inputElement.setSelectionRange(selectionStart, selectionStart));
      });
  }


  ionViewWillEnter() {

    this.toolbarAnimation = this.createToolbarAnimation();
    this.toolbarAnimation
      .delay(ModalAnimationSlideDuration)
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
