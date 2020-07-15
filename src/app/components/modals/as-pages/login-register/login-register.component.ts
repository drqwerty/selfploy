import { Component, ViewChild, Input } from '@angular/core';
import { IonToolbar, ModalController, IonSlides, IonInput, NavController, IonContent, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration, ModalAnimationFadeLeave } from 'src/app/animations/page-transitions';
import { User, UserRole } from 'src/app/models/user-model';
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ToastAnimationEnter, ToastAnimationLeave } from 'src/app/animations/toast-transitions';
import { FirebaseError } from 'firebase';
import { TermsAndConditionsComponent } from 'src/app/components/modals/terms-and-conditions/terms-and-conditions.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { CameraSourceActionSheetComponent } from 'src/app/components/action-sheets/camera-source-action-sheet/camera-source-action-sheet.component';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {

  @Input() email: string;
  @Input() name: string;
  @Input() profilePic: string;
  @Input() socialAccount: 'none' | 'google' | 'facebook' = 'none';
  @Input() token: string;

  profilePicWithoutCrop: any;

  @ViewChild(IonContent) ionContent: any;
  @ViewChild(IonToolbar) ionToolbar: any;
  @ViewChild(IonSlides) slides: IonSlides;
  @ViewChild('passwordInput') passwordInput: IonInput;

  userRole = UserRole;

  toolbarAnimation: Animation;
  loading: HTMLIonLoadingElement;
  rootModal: HTMLIonModalElement;

  slidesLength = 4;
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

  removePictureToast: HTMLIonToastElement;

  constructor(
    private modalController: ModalController,
    private navController: NavController,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private firestoreService: FirestoreService,
  ) {
    modalController.getTop().then(modal => this.rootModal = modal);

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
    if (this.socialAccount != 'none') {
      this.nameForm.setValue({ name: this.name });
      this.user.name = this.name;

    } else {
      this.toolbarAnimation = this.createToolbarAnimation();
      this.toolbarAnimation
        .delay(ModalAnimationSlideDuration)
        .play();
    }

    this.user.email = this.email;
    this.user.profilePic = this.profilePic;
    this.user.token = this.token;
  }


  ionViewWillLeave() {
    this.slides.isBeginning().then(beginning => {
      if (beginning && this.socialAccount == 'none') {
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
        this.updateNextButtonState(activeIndex, 'backward');
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
      if (this.socialAccount != 'none' && activeIndex === this.slidesLength - 2 || activeIndex === this.slidesLength - 1) {
        await this.removePictureToast?.dismiss();
        const modal = await this.createTermsAndConditionsModal();
        modal.present();
      } else {
        this.updateNextButtonState(activeIndex, 'forward');
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
      cssClass: 'modal',
    });
    modal.onWillDismiss().then(({ data }) => {
      if (data?.terms && data?.gprd) {
        this.user.hasProfilePic = this.user.profilePic != null;
        switch (this.socialAccount) {
          case 'none':
            this.signUpWithEmailAndPassword();
            break;

          case 'google':
            this.signUpWithGoogle();
            break;

          case 'facebook':
            this.signUpWithFacebook();
            break;
        }
      }
    });
    return modal;
  }


  nameFormValid(difference = 0) {
    // si se inicia con las rr.ss, se actualiza el next button de la primera slide
    this.slides.getActiveIndex().then(index => {
      if (index + difference === 1) {
        this.goNextDisabled = this.nameForm.invalid;
        if (!this.goNextDisabled) this.user.name = this.nameForm.value.name;
      }
    })
  }


  passwordFormValid() {
    this.goNextDisabled = this.passwordForm.invalid;
  }


  updateNextButtonState(activeIndex: number, direction: 'forward' | 'backward') {
    const difference = direction == 'forward' ? 1 : -1;
    const nextSlideIndex = activeIndex + difference;

    switch (nextSlideIndex) {
      case 0:
        this.goNextDisabled = this.user.role == undefined;
        break;
      case 1:
        this.nameFormValid(difference);
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


  setUserRole(role: UserRole, buttonSelected, buttonNotSelected) {
    this.user.role = role;
    this.goNextDisabled = false;

    buttonSelected.button = 'tertiary';
    buttonSelected.text = 'light';
    buttonNotSelected.button = 'light';
    buttonNotSelected.text = 'primary';
  }


  async showCameraSourcePrompt() {
    this.removePictureToast?.dismiss();
    const modal = await this.modalController.create({
      component: CameraSourceActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet',
      componentProps: {
        maintainAspectRatio: true,
        showRemoveButton: this.user.profilePic != null,
        profilePic: this.profilePicWithoutCrop ?? this.user.profilePic,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data?.image) this.updateImageVariables(data);
      else if (data?.remove) this.removeProfileImage();
    });

    modal.present();
  }


  updateImageVariables(data: { image: string, profilePicWithoutCrop: string }) {
    this.profilePicWithoutCrop = data.profilePicWithoutCrop;
    this.user.profilePic = data.image;
  }


  async removeProfileImage() {
    const profileImageTemp = this.user.profilePic;
    this.user.profilePic = null;

    this.removePictureToast = await this.toastController.create({
      message: 'Foto eliminada',
      duration: 3000,
      mode: 'ios',
      enterAnimation: ToastAnimationEnter,
      leaveAnimation: ToastAnimationLeave,
      position: 'bottom',
      buttons: [{
        side: 'end',
        text: 'Deshacer',
        handler: () => { this.user.profilePic = profileImageTemp; }
      }]
    });
    this.removePictureToast.present();
  }


  signUpWithEmailAndPassword() {
    this.signUp(this.authService.signUpWithEmailAndPassword(this.user, this.passwordForm.value.password));
  }


  signUpWithGoogle() {
    this.signUp(this.authService.signUpWithGoogle(this.user, this.token));
  }


  signUpWithFacebook() {
    this.signUp(this.authService.signUpWithFacebook(this.user, this.token));
  }


  signUp(signUpMethod: Promise<any>) {
    this.presentLoading();
    signUpMethod
      .then(
        () => this.goToMainPage(),
        reason => this.presentErrorInToast(reason)
      )
      .catch(reason => console.log(reason))
      .finally(() => this.loading.dismiss());
  }


  goToMainPage() {
    this.rootModal.leaveAnimation = ModalAnimationFadeLeave;
    this.navController.navigateRoot('tabs', { animated: false });
    setTimeout(() => this.rootModal.dismiss());
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
