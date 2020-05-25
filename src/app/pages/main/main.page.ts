import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ModalController, LoadingController, ToastController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { AuthService } from '../../services/auth.service';
import { LoginRegisterComponent } from '../../components/login-register/login-register.component';
import { ModalAnimationFadeWithMoveConentEnter, ModalAnimationFadeWithMoveConentLeave } from '../../animations/page-transitions';
import { ToastAnimationEnter, ToastAnimationLeave } from '../../animations/toast-transitions';
import { BehaviorSubject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage {

  @ViewChild('background') background: ElementRef;

  isLoadingObservable = new BehaviorSubject(false)

  backgroundAnimation: Animation;


  constructor(
    private navController: NavController,
    private authService: AuthService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) { }

  ionViewDidEnter() {
    if (!this.backgroundAnimation) this.createAnimations();
    this.playBackgroundAnimation(true);
  }

  continueWithEmail() {
    this.playBackgroundAnimation().then(() => {
      this.navController.navigateForward('login-email', { animated: false });
    });
  }

  continueWithGoogle() {
    this.continueWithSocialAccount(this.authService.getGoogleUser, 'google.com');
  }

  continueWithFacebook() {
    this.continueWithSocialAccount(this.authService.getFacebookUser, 'facebook.com');
  }

  continueWithSocialAccount(getUserPromise: () => Promise<any>, socialAccount: 'google.com' | 'facebook.com') {
    getUserPromise().then(user => {
      this.authService.checkEmail(user.email).then(res => {
        if (res.includes(socialAccount))
          this.tryToLogin(user.token, socialAccount)
        else
          this.goToRegisterPage(user)
      }).catch(() => this.showError());
    })
  }

  async goToRegisterPage(componentProps) {
    const modal = await this.createModal(componentProps);
    this.playBackgroundAnimation().then(() => modal.present());
  }

  async tryToLogin(token: string, socialAccount: 'google.com' | 'facebook.com') {
    const loading = await this.loadingController.create();
    Promise
      .all([
        this.playBackgroundAnimation().then(() => loading.present().then(() => this.isLoadingObservable.next(true))),
        this.authService.loginWithSocialAccount(token, socialAccount),
      ])
      .then(() => this.dismissLoadingAndLogin(loading))
      .catch(reason => this.dismissLoadingAndShowError(loading, reason));
  }

  dismissLoadingAndLogin(loading: HTMLIonLoadingElement) {
    return loading.dismiss().then(() => this.navController.navigateForward('tabs', { animated: false }));
  }

  dismissLoadingAndShowError(loading: HTMLIonLoadingElement, reason: any) {
    this.isLoadingObservable
      .pipe(takeWhile(isLoading => !isLoading, true))
      .subscribe(isLoading => {
        if (isLoading) {
          this.isLoadingObservable.next(false);
          loading.dismiss()
            .then(() => this.playBackgroundAnimation(true)
              .then(() => this.showError(reason)));
        }
      });
  }

  async createModal(componentProps) {
    const modal = await this.modalController.create({
      component: LoginRegisterComponent,
      componentProps,
      enterAnimation: ModalAnimationFadeWithMoveConentEnter,
      leaveAnimation: ModalAnimationFadeWithMoveConentLeave,
    });
    modal.onDidDismiss().then(() => this.playBackgroundAnimation(true));
    return modal;
  }

  async showError(errorReason = null) {
    let message;
    switch (errorReason?.code ?? '') {
      case 'auth/user-disabled':
        message = 'Tu cuenta ha sido deshabilitada';
        break;
      default:
        message = errorReason?.message ?? 'Error desconocido';
        break;
    }
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      mode: 'ios',
      enterAnimation: ToastAnimationEnter,
      leaveAnimation: ToastAnimationLeave,
    });
    toast.present();
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
