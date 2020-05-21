import { Component, ViewChild, Input } from '@angular/core';
import { ModalController, IonToolbar, IonInput, LoadingController, ToastController, NavController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration, ModalAnimationFadeLeave } from '../animations/page-transitions';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { FirebaseError } from 'firebase';
import { ToastAnimationEnter, ToastAnimationLeave } from '../animations/toast-transitions';
import { FirestoreService } from '../firestore.service';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.component.html',
  styleUrls: ['./login-password.component.scss'],
})
export class LoginPasswordComponent {

  @Input() email: string;

  @ViewChild(IonToolbar) ionToolbar: any;
  @ViewChild('passwordInput') passwordInput: IonInput;

  toolbarAnimation: Animation;
  loading: HTMLIonLoadingElement;

  passwordInputType: 'password' | 'text' = 'password';
  passwordInputIcon: 'eye' | 'eye-off' = 'eye';

  passwordForm: FormGroup;


  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
    private toastController: ToastController,
    private navController: NavController,
    private firestoreService: FirestoreService,
    private storageService: StorageService,
  ) {

    this.passwordForm = this.formBuilder.group({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
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


  goBack() {

    this.modalController.dismiss({ animate: true });
  }


  async goNext() {

    if (this.passwordForm.invalid) return;

    this.signIn();
  }


  async signIn() {

    await this.presentLoading();

    this.authService
      .login(this.email, this.passwordForm.value.password)
      .then(value => this.firestoreService.loadUserProfile(value.user.uid)
        .then(documentSnapshot => {
          this.saveUserData(documentSnapshot.data());
          this.goToMainPage();
        }))
      .catch(reason => this.presentErrorInToast(reason))
      .then(() => this.loading.dismiss());
  }


  saveUserData(data: firebase.firestore.DocumentData) {

    return this.storageService.saveUserProfile(data.d);
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
      case 'auth/wrong-password':
        message = 'Contraseña incorrecta';
        break;

      case 'auth/too-many-requests':
        message = 'Demasiados intentos. Prueba más tarde';
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
