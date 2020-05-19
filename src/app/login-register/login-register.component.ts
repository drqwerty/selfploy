import { Component, ViewChild, Input } from '@angular/core';
import { IonToolbar, ModalController, IonSlides, IonInput, NavController, IonContent, LoadingController, ToastController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration, ModalAnimationFadeLeave } from '../animations/page-transitions';
import { User, UserType } from '../user-model';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastAnimationEnter, ToastAnimationLeave } from '../animations/toast-transitions';
import { FirebaseError } from 'firebase';
import { TermsAndConditionsComponent } from '../terms-and-conditions/terms-and-conditions.component';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {

  @Input() email: string;

  @ViewChild(IonContent) ionContent: any;
  @ViewChild(IonToolbar) ionToolbar: any;
  @ViewChild(IonSlides) slides: IonSlides;
  @ViewChild('passwordInput') passwordInput: IonInput;

  userType = UserType;

  toolbarAnimation: Animation;
  loading: HTMLIonLoadingElement;

  slidesLength: number;
  slideOpts = {
    initialSlide: 0,
    pagination: false,
    speed: ModalAnimationSlideDuration,
    allowSlideNext: false,
    allowSlidePrev: false,
  };
  goNextDisabled = true;
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

  user: User;
  nameForm: FormGroup;
  passwordForm: FormGroup;
  profileImage = '';


  constructor(
    private modalController: ModalController,
    private navController: NavController,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
  ) {

    this.nameForm = this.formBuilder.group({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
    this.passwordForm = this.formBuilder.group({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });

    this.user = new User();
  }



  ionViewWillEnter() {

    this.toolbarAnimation = this.createToolbarAnimation();
    this.toolbarAnimation
      .delay(ModalAnimationSlideDuration)
      .play();

    this.slides.length().then(length => this.slidesLength = length);
    this.user.email = this.email;
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


  goBack() {

    this.slides.getActiveIndex().then(activeIndex => {

      if (activeIndex === 0) {
        this.modalController.dismiss({ animate: true });

      } else {
        this.updateNextButtonState(activeIndex - 1);
        this.slides.lockSwipeToPrev(false)
          .then(() => {
            this.slides.slidePrev();
            this.slides.lockSwipeToPrev(true);
          });
      }
    })
  }


  goNext() {

    if (this.goNextDisabled) return;

    this.slides.getActiveIndex().then(async activeIndex => {

      if (activeIndex === this.slidesLength - 1) {
        const modal = await this.createTermsAndConditionsModal();
        modal.present();

      } else {
        this.updateNextButtonState(activeIndex + 1);
        this.slides.lockSwipeToNext(false)
          .then(() => {
            this.slides.slideNext();
            this.slides.lockSwipeToNext(true);
          });
      }
    });
  }


  async createTermsAndConditionsModal() {

    const modal = await this.modalController.create({
      component: TermsAndConditionsComponent,
      cssClass: 'modal-terms-and-conditions',
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data?.terms && data?.gprd) this.signUp();
    });

    return modal;
  }


  nameFormValid() {

    this.goNextDisabled = this.nameForm.invalid;
    if (!this.goNextDisabled) this.user.name = this.nameForm.value.name;
  }


  passwordFormValid() {

    this.goNextDisabled = this.passwordForm.invalid;
  }


  updateNextButtonState(activeIndex: number) {

    switch (activeIndex) {
      case 0:
        this.goNextDisabled = this.user.type == undefined;
        break;

      case 1:
        this.nameFormValid();
        break;

      case 2:
        this.goNextDisabled = false;
        break;

      case 3:
        this.passwordFormValid();
        break;

      default:
        break;
    }
  }


  setUserType(type: UserType, buttonSelected, buttonNotSelected) {

    this.user.type = type;
    this.goNextDisabled = false;

    buttonSelected.button = 'tertiary';
    buttonSelected.text = 'light';
    buttonNotSelected.button = 'light';
    buttonNotSelected.text = 'primary';
  }


  signUp() {

    this.presentLoading();

    this.authService
      .signUp(this.user, this.passwordForm.value.password)
      .then(
        value => this.createUserProfile(value).then(() => this.goToMainPage()),
        reason => this.presentErrorInToast(reason)
      )
      .catch(reason => console.log(reason))
      .then(() => this.loading.dismiss());
  }


  createUserProfile(value: firebase.auth.UserCredential) {

    console.log(value)
    return new Promise(resolve => resolve());
  }


  goToMainPage() {

    this.navController.navigateRoot('tabs', { animated: false })
      .then(() => this.modalController.getTop().then(modal => {
        modal.leaveAnimation = ModalAnimationFadeLeave;
        setTimeout(() => this.modalController.dismiss());
      }));
  }


  async presentLoading() {

    this.loading = await this.loadingController.create();
    await this.loading.present();
  }


  async presentErrorInToast(error: FirebaseError) {

    console.log(error);

    let message: string;

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Este correo ya está en uso';
        break;

      default:
        message = error.code;
        break;
    }

    const toast = await this.toastController.create({
      message,
      duration: 2000,
      mode: 'ios',
      cssClass: 'login-toast',
      enterAnimation: ToastAnimationEnter,
      leaveAnimation: ToastAnimationLeave,
    });
    toast.present();
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


  createToolbarAnimation() {

    return createAnimation()
      .addElement(this.ionToolbar.el)
      .fromTo('opacity', '0', '1');
  }

}
