import { Component } from '@angular/core';
import { NavController, Platform, ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { tabBarAnimateIn, tabBarAnimateOut } from "src/app/animations/tab-bar-transition";

import { Plugins, StatusBarStyle } from '@capacitor/core';
import { User, UserRole } from 'src/app/models/user-model';
import { StorageService } from 'src/app/services/storage.service';
import { InputBottomSheetComponent } from 'src/app/components/input-bottom-sheet/input-bottom-sheet.component';
import { CameraSourceActionSheetComponent } from 'src/app/components/camera-source-action-sheet/camera-source-action-sheet.component';
import { FormBuilder, FormControl, Validators, ValidatorFn } from '@angular/forms';
const { StatusBar } = Plugins;

import { ModalAnimationSlideWithOpacityEnter, ModalAnimationSlideWithOpacityLeave } from 'src/app/animations/page-transitions';
import { ServicePickerComponent } from 'src/app/components/service-picker/service-picker.component';
import { WorkingHoursPickerComponent } from 'src/app/components/working-hours-picker/working-hours-picker.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import { MapLocationComponent } from 'src/app/components/map-location/map-location.component';
import { MapRangeComponent } from 'src/app/components/map-range/map-range.component';
import { DataService } from 'src/app/providers/data.service';

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage {

  forceCompleteProfile = false;
  clientToProfessional = false;

  tempUser: User;
  userRol = UserRole;

  pageAlreadyLeave = false;

  updateImageProfile = false;
  profilePicWithoutCrop: any;
  removePictureToast: HTMLIonToastElement;

  headerName = 'Nombre completo';
  headerCompany = 'Empresa';
  headerServices = 'Servicios';
  headerWorkingHours = 'Horario';
  headerAbout = 'Sobre mí'


  constructor(
    private navController: NavController,
    private storage: StorageService,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreService,
    private fStorage: FirebaseStorage,
    private data: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
  ) {
    route.queryParams.subscribe(() => {
      this.forceCompleteProfile = router.getCurrentNavigation().extras.state?.forceCompleteProfile ?? true;
      this.clientToProfessional = router.getCurrentNavigation().extras.state?.clientToProfessional ?? false;
    });
  }

  ionViewWillLeave() {
    this.pageAlreadyLeave = true;
    tabBarAnimateIn();
  }

  ionViewWillEnter() {
    this.getUser();
    tabBarAnimateOut();
    StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  async getUser() {
    this.tempUser = new User();
    if (!this.data.user) this.data.user = await this.storage.getUserProfile();
    Object.assign(this.tempUser, this.data.user);
    if (this.clientToProfessional) {
      this.tempUser.role = this.userRol.professional;
      this.tempUser.profileCompleted = false;
    }
  }

  goBack() {
    if (this.clientToProfessional) {
      this.notificateNotUpgradeProfile()
    } else {
      tabBarAnimateIn();
      this.navController.navigateBack('tabs');
    }
  }

  async notificateNotUpgradeProfile() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert not-upgrade',
      header: 'No se guardarán los cambios',
      message: 'Seguirás teniendo un perfil de cliente, ¿quieres continuar?',
      buttons: [
        {
          text: 'No, ¡espera!',
          role: 'cancel',
        }, {
          cssClass: 'confirm-button',
          text: 'Prefiero seguir como cliente',
          handler: () => this.navController.navigateBack('tabs'),
        }
      ]
    });

    alert.present();
  }

  async updateUser() {

    let message: string;

    (await this.loadingController.create()).present();

    try {
      this.tempUser.profileCompleted = this.profileIsComplete();
      if (this.updateImageProfile) await this.fStorage.uploadUserProfilePic(this.tempUser.profilePic);
      await this.firestoreService.updateUserProfile(this.tempUser);
      this.storage.saveUserProfile(this.tempUser);
      message = 'Perfil actualizado';
      if (!this.tempUser.profileCompleted) message += '\naunque faltan algunos datos...';
      Object.assign(this.data.user, this.tempUser);
      this.updateImageProfile = false;
      this.clientToProfessional = false;
    } catch (error) {
      message = 'Ha ocurrido un error, inténtalo de nuevo';
    }

    const toast = await this.presentToast(message);
    this.leavePageIfPossible(toast);
  }

  profileIsComplete() {
    if (this.tempUser.role === UserRole.professional && !this.tempUser.profileCompleted) {
      const properties = ["services", "workingHours", "coordinates"];
      for (const property of properties) if (_.isEmpty(this.tempUser[property])) return false;
      if (!this.tempUser.radiusKm) return false;
    }
    return true;
  }

  private async presentToast(message: string) {
    let toast: HTMLIonToastElement;

    await Promise.all([
      this.loadingController.dismiss(),
      this.toastController.create({
        message,
        duration: 2000,
        mode: 'ios',
        cssClass: 'ion-text-center',
      }).then(htmlToast => toast = htmlToast),
    ]);

    toast.present();
    return toast;
  }

  private leavePageIfPossible(toast: HTMLIonToastElement) {
    if (this.forceCompleteProfile && this.tempUser.profileCompleted) toast.onWillDismiss().then(() => {
      if (!this.pageAlreadyLeave) this.goBack();
    });
  }

  async showCameraSourcePrompt() {
    this.removePictureToast?.dismiss();
    const modal = await this.modalController.create({
      component: CameraSourceActionSheetComponent,
      cssClass: 'action-sheet',
      componentProps: {
        showRemoveButton: this.tempUser.profilePic != null,
        profilePic: this.profilePicWithoutCrop ?? this.tempUser.profilePic,
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
    this.tempUser.profilePic = data.image;
    this.tempUser.hasProfilePic = true;
    this.updateImageProfile = true;
  }

  async removeProfileImage() {
    const profileImageTemp = this.tempUser.profilePic;
    this.tempUser.profilePic = null;
    this.tempUser.hasProfilePic = false;

    this.removePictureToast = await this.toastController.create({
      message: 'Foto eliminada',
      duration: 3000,
      mode: 'ios',
      position: 'bottom',
      buttons: [{
        side: 'end',
        text: 'Deshacer',
        handler: () => {
          this.tempUser.profilePic = profileImageTemp;
          this.tempUser.hasProfilePic = true;
        }
      }]
    });
    this.removePictureToast.present();
  }

  editName() {
    this.presentInputBottomSheet(this.headerName, 'name');
  }

  editCompany() {
    this.presentInputBottomSheet(this.headerCompany, 'companyName', true);
  }

  editAbout() {
    this.presentInputBottomSheet(this.headerAbout, 'about', true, 'text-area');
  }

  async editServices() {
    const modal = await this.modalController.create({
      component: ServicePickerComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityLeave,
      componentProps: {
        title: this.headerServices,
        userServices: this.tempUser.services
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.tempUser.services = data;
    });

    modal.present();
  }

  async editWorkingHours() {
    const modal = await this.modalController.create({
      component: WorkingHoursPickerComponent,
      cssClass: 'modal-working-hours',
      componentProps: {
        title: this.headerWorkingHours,
        userWorkingHours: this.tempUser.workingHours
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.tempUser.workingHours = data;
    });

    modal.present();
  }

  async editLocation() {
    const modal = await this.modalController.create({
      component: MapLocationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityLeave,
      componentProps: {
        hideLocationAccuracy: this.tempUser.hideLocationAccuracy,
        addressFull: this.tempUser.addressFull,
        addressCity: this.tempUser.addressCity,
        coordinates: this.tempUser.coordinates,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        this.tempUser.hideLocationAccuracy = data.hideLocationAccuracy;
        this.tempUser.addressFull = data.addressFull;
        this.tempUser.addressCity = data.addressCity;
        this.tempUser.coordinates = data.coordinates;
      }
    });

    modal.present();
  }

  async editRange() {
    const modal = await this.modalController.create({
      component: MapRangeComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityLeave,
      componentProps: {
        coordinates: this.tempUser.coordinates,
        radiusKm: this.tempUser.radiusKm,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        console.log(data);
        this.tempUser.radiusKm = data
      }
    });

    modal.present();
  }

  async presentInputBottomSheet(title, userProperty, optional = false, type: 'input' | 'text-area' = 'input') {

    const validators = optional ? [] : [Validators.required, Validators.minLength(3)];

    const modal = await this.modalController.create({
      component: InputBottomSheetComponent,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        type,
        title,
        form: this.formBuilder.group({
          value: new FormControl(this.tempUser[userProperty], validators),
        })
      },
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.tempUser[userProperty] = data.value;
    });

    modal.present();
  }

  async showMakeMeClientAlert() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert danger',
      header: 'Se eliminarán los siguientes datos:',
      message: `
      -Tu perfil como profesional.<br><br>
      -Los datos de tu perfil relacionados con el profesional.<br><br>
      -Encargos aceptados como profesional.<br><br>
      ¿Quieres continuar?
      `,
      buttons: [
        {
          text: 'No, ¡espera!',
          role: 'cancel',
        }, {
          cssClass: 'confirm-button',
          text: 'Sí, hazme solo cliente',
          handler: () => this.makeMeClient(),
        }
      ]
    });

    alert.present();
  }

  makeMeClient() {
    this.forceCompleteProfile = false;
    this.tempUser.role = this.userRol.client;
    this.tempUser.about = '';
    this.tempUser.companyName = '';
    this.tempUser.radiusKm = 0;
    this.tempUser.services = {};
    this.tempUser.workingHours = [];
    this.updateUser();
  }

}
