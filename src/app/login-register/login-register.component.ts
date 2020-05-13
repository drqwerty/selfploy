import { Component, ViewChild } from '@angular/core';
import { IonToolbar, ModalController, IonSlides, IonInput, NavController, IonContent } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration, ModalAnimationFadeLeave } from '../animations/page-transitions';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {

  @ViewChild(IonContent, { static: false }) ionContent: any;
  @ViewChild(IonToolbar, { static: false }) ionToolbar: any;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;
  @ViewChild('passwordInput', { static: false }) passwordInput: IonInput;

  toolbarAnimation: Animation;
  slideOpts = {
    initialSlide: 0,
    pagination: false,
    speed: ModalAnimationSlideDuration,
    allowSlideNext: false,
    allowSlidePrev: false,
  };
  passwordInputType: 'password' | 'text' = 'password';
  passwordInputIcon: 'eye' | 'eye-off' = 'eye';

  buttonsColors = {
    client: {
      button: 'light',
      text: 'primary'
    },
    professional: {
      button: 'light',
      text: 'primary'
    }
  };

  profileImage = '';


  constructor(
    private modalController: ModalController,
    private navController: NavController,
  ) { }


  onClick(button: number) {

    this.buttonsColors.client.button = button == 1 ? 'tertiary' : 'light';
    this.buttonsColors.client.text = button == 1 ? 'light' : 'primary';
    this.buttonsColors.professional.button = button == 2 ? 'tertiary' : 'light';
    this.buttonsColors.professional.text = button == 2 ? 'light' : 'primary';
  }


  goNext() {

    this.slides.isEnd().then(end => {

      if (end) {
        this.navController.navigateForward('tabs', { animated: false })
          .then(() => this.modalController.getTop().then(modal => {
            modal.leaveAnimation = ModalAnimationFadeLeave;
            setTimeout(() => this.modalController.dismiss());
          }));

      } else {
        this.slides.lockSwipeToNext(false)
          .then(() => {
            this.slides.slideNext();
            this.slides.lockSwipeToNext(true);
          });
      }
    });
  }


  goBack() {

    this.slides.isBeginning().then(beginning => {

      if (beginning) {
        this.modalController.dismiss();

      } else {
        this.slides.lockSwipeToPrev(false)
          .then(() => {
            this.slides.slidePrev();
            this.slides.lockSwipeToPrev(true);
          });
      }
    })
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

    this.slides.isBeginning().then(beginning => {

      if (beginning) {
        this.toolbarAnimation
          .delay(0)
          .direction('reverse')
          .play();
      }
    })
  }


  createToolbarAnimation() {

    return createAnimation()
      .addElement(this.ionToolbar.el)
      .fromTo('opacity', '0', '1');
  }


}
