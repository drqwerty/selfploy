import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ModalController, Platform } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { LoginPasswordComponent } from '../login-password/login-password.component';
import { ModalAnimationSlideEnter, ModalAnimationSlideLeave } from '../animations/page-transitions';

@Component({
  selector: 'app-login-email',
  templateUrl: './login-email.page.html',
  styleUrls: ['./login-email.page.scss'],
})
export class LoginEmailPage {

  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('backButton', { static: false }) backButton: ElementRef;
  @ViewChild('continueButton', { static: false }) continueButton: ElementRef;

  animation: Animation;

  constructor(
    private navController: NavController,
    private modalController: ModalController,
    private platfrom: Platform,
  ) { }


  ionViewWillEnter() {

    this.createFadeAnimation();
    this.animation.direction('normal').play();
  }


  goBack() {

    this.animation.direction('reverse').play()
      .then(() =>
        this.navController.navigateBack('main', { animated: false })
      );
  }


  async goNext() {

    const modal = await this.modalController.create({
      component: LoginPasswordComponent,
      enterAnimation: ModalAnimationSlideEnter,
      leaveAnimation: ModalAnimationSlideLeave,
      showBackdrop: false,
      cssClass: 'modal-fullscreen',
    });

    const slideAnimation = this.createSlideAnimation();
    slideAnimation.direction('normal').play();
    modal.onWillDismiss().then(() => slideAnimation.direction('reverse').play());

    modal.present();
  }


  createSlideAnimation(): Animation {

    return createAnimation()
      .addElement(this.content.nativeElement)
      .fromTo('transform', 'translateX(0)', `translateX(-${this.platfrom.width()}px)`)
      .duration(200)
      .easing('linear')
  }


  createFadeAnimation(): Animation {

    if (this.animation != null) return;

    const elements = [this.content, this.backButton, this.continueButton];

    const animations = elements.map(element =>
      createAnimation()
        .addElement(element.nativeElement)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(-5px)', 'translateY(0px)')
    )

    this.animation = createAnimation()
      .duration(200)
      .addAnimation(animations);
  }

}
