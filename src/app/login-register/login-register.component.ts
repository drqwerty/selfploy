import { Component, ViewChild } from '@angular/core';
import { IonToolbar, ModalController, IonSlides } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration } from '../animations/page-transitions';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {

  @ViewChild(IonToolbar, { static: false }) ionToolbar: any;
  @ViewChild(IonSlides, { static: false }) slides: IonSlides;

  toolbarAnimation: Animation;
  slideOpts = {
    initialSlide: 0,
    pagination: false,
    speed: ModalAnimationSlideDuration,
    allowSlideNext: false,
    allowSlidePrev: false,
  };

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
  ) { }


  onClick(button: number) {
    
    this.buttonsColors.client.button = button == 1 ? 'tertiary' : 'light';
    this.buttonsColors.client.text = button == 1 ? 'light' : 'primary';
    this.buttonsColors.professional.button = button == 2 ? 'tertiary' : 'light';
    this.buttonsColors.professional.text = button == 2 ? 'light' : 'primary';
  }


  goNext() {

    this.slides.lockSwipeToNext(false)
      .then(() => {
        this.slides.slideNext();
        this.slides.lockSwipeToNext(true);
      });
  }


  goBack() {

    this.slides.getActiveIndex()
      .then(currentSlide => {

        if (currentSlide == 0) {
          this.ionToolbar = null;
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
