import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { AuthService } from '../auth.service';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { ModalAnimationFadeWithMoveConentEnter, ModalAnimationFadeWithMoveConentLeave } from '../animations/page-transitions';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage {

  @ViewChild('background') background: ElementRef;

  backgroundAnimation: Animation;


  constructor(
    private navController: NavController,
    private authService: AuthService,
    private modalController: ModalController,
    private loadingController: LoadingController
  ) { }


  ionViewDidEnter() {

    if (!this.backgroundAnimation) this.createAnimations();
    this.playBackgroundAnimation(true);
  }


  continueWithEmail() {

    this.playBackgroundAnimation()
      .then(() => {
        this.navController.navigateForward('login-email', { animated: false });
      });
  }

  async continueWithGoogle() {

    this.authService.getGoogleUser()
      .then(googleUser => {
        this.authService.checkEmail(googleUser.email)
          .then(async res => {

            if (res.includes('google.com')) {
              const loading = await this.loadingController.create();

              Promise.all([
                this.playBackgroundAnimation().then(() => loading.present()),
                this.authService.loginWithGoogle(googleUser.authentication.idToken),
              ]).then(() => {
                loading.dismiss()
                  .then(() => this.navController.navigateForward('tabs', { animated: false }));
              });

            } else {
              const modal = await this.modalController.create({
                component: LoginRegisterComponent,
                componentProps: {
                  email: googleUser.email,
                  name: googleUser.displayName ?? googleUser.name,
                  socialAccount: 'google',
                  idToken: googleUser.authentication.idToken
                },
                enterAnimation: ModalAnimationFadeWithMoveConentEnter,
                leaveAnimation: ModalAnimationFadeWithMoveConentLeave,
              });

              modal.onDidDismiss().then(() => this.playBackgroundAnimation(true));

              this.playBackgroundAnimation()
                .then(() => modal.present());
            }

          });
      })
  }


  continueWithFacebook() {

    this.authService.getFacebookUser()
      .then(facebookUser => {
        this.authService.checkEmail(facebookUser.email)
          .then(async res => {

            console.log(res);
            if (res.includes('facebook.com')) {
              const loading = await this.loadingController.create();

              Promise.all([
                this.playBackgroundAnimation().then(() => loading.present()),
                this.authService.loginWithFacebook(facebookUser.token),
              ]).then(() => {
                loading.dismiss()
                  .then(() => this.navController.navigateForward('tabs', { animated: false }));
              });

            } else {
              const modal = await this.modalController.create({
                component: LoginRegisterComponent,
                componentProps: {
                  email: facebookUser.email,
                  name: facebookUser.name,
                  socialAccount: 'facebook',
                  idToken: facebookUser.token
                },
                enterAnimation: ModalAnimationFadeWithMoveConentEnter,
                leaveAnimation: ModalAnimationFadeWithMoveConentLeave,
              });

              modal.onDidDismiss().then(() => this.playBackgroundAnimation(true));

              this.playBackgroundAnimation()
                .then(() => modal.present());
            }

          })
      })
      .catch(() => console.error('errorcito con facebook'));
  }


  playBackgroundAnimation(reverse = false): Promise<void> {

    const direction = reverse ? 'reverse' : 'normal';
    const easing = reverse ? 'ease-in' : 'ease-out';

    return this.backgroundAnimation
      .direction(direction)
      .easing(easing)
      .play();
  }


  createAnimations() {

    this.backgroundAnimation = createAnimation()
      .addElement(this.background.nativeElement)
      // .delay(1000)
      .fromTo('transform', 'translateY(-100%)', `translateY(0)`)
      .duration(500);
  }

}
