import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, ModalController, Platform, LoadingController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { LoginPasswordComponent } from '../login-password/login-password.component';
import { ModalAnimationSlideEnter, ModalAnimationSlideLeave, ModalAnimationSlideDuration, ModalAnimationSlideEasing } from '../animations/page-transitions';
import { LoginRegisterComponent } from '../login-register/login-register.component';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login-email',
  templateUrl: './login-email.page.html',
  styleUrls: ['./login-email.page.scss'],
})
export class LoginEmailPage {

  @ViewChild('content') content: ElementRef;
  @ViewChild('backButton') backButton: ElementRef;
  @ViewChild('continueButton') continueButton: ElementRef;

  animation: Animation;
  loading: HTMLIonLoadingElement;

  emailForm: FormGroup;

  goNextDisabled = true;
  nextButtonText: 'Siguiente' | 'Iniciar sesión';


  constructor(
    private navController: NavController,
    private modalController: ModalController,
    private platfrom: Platform,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
  ) {

    this.nextButtonText = 'Siguiente';
    this.emailForm = this.formBuilder.group({
      email: new FormControl('', [
        Validators.required,
      ]),
    });
  }


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

    if (this.emailForm.invalid) return;

    this.updateNextButtonStatus(true);
    await this.presentLoading();

    this.authService.checkEmail(this.emailForm.value.email)
      .then(async res => {
        this.loading.dismiss();

        let component: typeof LoginPasswordComponent | typeof LoginRegisterComponent;
        if (res.includes('password')) {
          component = LoginPasswordComponent;
          this.nextButtonText = 'Iniciar sesión'
        } else {
          component = LoginRegisterComponent;
        }
        const slideAnimation = this.createSlideAnimation();
        const modal = await this.createModal(component, slideAnimation);

        modal.present();
        slideAnimation.direction('normal').play();
      })
      .catch(() => this.loading.dismiss());
  }


  private async createModal(component: typeof LoginPasswordComponent | typeof LoginRegisterComponent, animation: Animation) {

    const modal = await this.modalController.create({
      component,
      enterAnimation: ModalAnimationSlideEnter,
      leaveAnimation: ModalAnimationSlideLeave,
      showBackdrop: false,
      cssClass: 'modal-fullscreen',
      componentProps: {
        email: this.emailForm.value.email
      },
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data?.animate) animation.direction('reverse').play();
      this.nextButtonText = 'Siguiente';
      this.updateNextButtonStatus(false);
    });

    return modal;
  }


  updateNextButtonStatus(disabled = this.emailForm.invalid) {

    this.goNextDisabled = disabled;
  }


  async presentLoading() {

    this.loading = await this.loadingController.create();
    await this.loading.present();
  }


  createSlideAnimation(): Animation {

    return createAnimation()
      .addElement(this.content.nativeElement)
      .fromTo('transform', 'translateX(0)', `translateX(-${this.platfrom.width()}px)`)
      .duration(ModalAnimationSlideDuration)
      .easing(ModalAnimationSlideEasing)
  }


  createFadeAnimation(): Animation {

    if (this.animation != null) return;

    const contentAnimation = createAnimation()
        .addElement(this.content.nativeElement)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(-5px)', 'translateY(0px)');

    this.animation = createAnimation()
      .duration(200)
      .addAnimation(contentAnimation);
  }

}
