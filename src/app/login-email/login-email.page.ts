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

  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('backButton', { static: false }) backButton: ElementRef;
  @ViewChild('continueButton', { static: false }) continueButton: ElementRef;

  animation: Animation;

  emailForm: FormGroup;
  loading: HTMLIonLoadingElement;


  constructor(
    private navController: NavController,
    private modalController: ModalController,
    private platfrom: Platform,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
  ) {

    this.emailForm = this.formBuilder.group({
      email: new FormControl('test@test.test2', [
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

    await this.presentLoading();

    this.authService.checkEmail(this.emailForm.value.email)
      .then(async res => {
        
        this.loading.dismiss();
        
        const component = res.includes('password') ? LoginPasswordComponent : LoginRegisterComponent;
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

        const slideAnimation = this.createSlideAnimation();
        slideAnimation.direction('normal').play();
        modal.onWillDismiss().then(() => slideAnimation.direction('reverse').play());

        modal.present();
      })
      .catch(() => this.loading.dismiss());
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
