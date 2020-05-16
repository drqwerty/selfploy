import { Component, ViewChild, Input } from '@angular/core';
import { ModalController, IonToolbar, IonInput, LoadingController, ToastController, NavController } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { ModalAnimationSlideDuration, ModalAnimationFadeLeave } from '../animations/page-transitions';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../auth.service';
import { FirebaseError } from 'firebase';
import { ToastAnimationEnter, ToastAnimationLeave } from '../animations/toast-transitions';

@Component({
  selector: 'app-login-password',
  templateUrl: './login-password.component.html',
  styleUrls: ['./login-password.component.scss'],
})
export class LoginPasswordComponent {

  @Input() email: string;

  @ViewChild(IonToolbar, { static: false }) ionToolbar: any;
  @ViewChild('passwordInput', { static: false }) passwordInput: IonInput;

  toolbarAnimation: Animation;
  passwordInputType: 'password' | 'text' = 'password';
  passwordInputIcon: 'eye' | 'eye-off' = 'eye';

  loading: HTMLIonLoadingElement;
  passwordForm: FormGroup;


  constructor(
    private modalController: ModalController,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private authService: AuthService,
    private toastController: ToastController,
    private navController: NavController
  ) {

    this.passwordForm = this.formBuilder.group({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
    });
  }


  goBack() {

    this.modalController.dismiss({ animate: true });
  }


  async goNext() {

    if (this.passwordForm.invalid) return;

    await this.presentLoading();
    this.authService.login(this.email, this.passwordForm.value.password)

      .then(res => {
        this.loading.dismiss();
        this.navController.navigateRoot('tabs', { animated: false })
          .then(() => this.modalController.getTop().then(modal => {
            modal.leaveAnimation = ModalAnimationFadeLeave;
            setTimeout(() => this.modalController.dismiss());
          }));
      })

      .catch((error: FirebaseError) => {
        this.loading.dismiss();
        let message;

        switch (error.code) {
          case 'auth/wrong-password':
            message = 'Contraseña incorrecta';
            break;

          case 'auth/too-many-requests':
            message = 'Demasiados intentos. Prueba más tarde';
            break;

          default:
            message = error.message;
            break;
        }

        this.presentToast(message);
        console.log(error);
      })
  }


  async presentLoading() {

    this.loading = await this.loadingController.create();
    await this.loading.present();
  }


  async presentToast(message: string) {

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
