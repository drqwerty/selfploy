import { Component, ViewChild,  } from '@angular/core';
import { NavController, ModalController, ToastController, LoadingController, AlertController, IonContent } from '@ionic/angular';
import { tabBarAnimateIn, tabBarAnimateOut } from "src/app/animations/tab-bar-transition";

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { User, UserRole, UserProperties } from 'src/app/models/user-model';
import { InputBottomSheetComponent } from 'src/app/components/bottom-sheets/input-bottom-sheet/input-bottom-sheet.component';
import { CameraSourceActionSheetComponent } from 'src/app/components/action-sheets/camera-source-action-sheet/camera-source-action-sheet.component';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
const { StatusBar } = Plugins;

import { ModalAnimationSlideWithOpacityEnter, ModalAnimationSlideWithOpacityLeave } from 'src/app/animations/page-transitions';
import { ServicePickerComponent } from 'src/app/components/modals/as-pages/service-picker/service-picker.component';
import { WorkingHoursPickerComponent } from 'src/app/components/modals/working-hours-picker/working-hours-picker.component';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import { MapLocationComponent } from 'src/app/components/modals/as-pages/map-location/map-location.component';
import { MapRangeComponent } from 'src/app/components/modals/as-pages/map-range/map-range.component';
import { DataService } from 'src/app/providers/data.service';
import Utils from "src/app/utils";

import * as _ from 'lodash';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage {

  @ViewChild(IonContent) content: IonContent;

  forceCompleteProfile: boolean;
  clientToProfessional: boolean;
  activeProfessionalProfile: boolean;

  user: User;
  tempUser: User;
  userRol = UserRole;

  pageAlreadyLeave = false;
  hideHeaderBorder = true;

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
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private fStorage: FirebaseStorage,
    private data: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
  ) {
    route.queryParams.subscribe(() => {
      this.forceCompleteProfile = router.getCurrentNavigation().extras.state?.forceCompleteProfile ?? true;
      this.clientToProfessional = router.getCurrentNavigation().extras.state?.clientToProfessional ?? false;
      this.activeProfessionalProfile = router.getCurrentNavigation().extras.state?.activeProfessionalProfile ?? false;
    });
  }

  ionViewWillLeave() {
    this.pageAlreadyLeave = true;
    tabBarAnimateIn();
  }

  ionViewWillEnter() {
    this.getUser();
    tabBarAnimateOut();
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewDidEnter() {
    if (this.activeProfessionalProfile)
      this.content.scrollToBottom(1000)
        .then(() => this.showEnableProfessionalAccountAlert());
  }

  updateHeaderShadow(scrollTop: number) {
    this.hideHeaderBorder = scrollTop === 0;
  }

  async getUser() {
    this.user = await this.data.getMyProfile();
    this.tempUser = new User();
    Object.assign(this.tempUser, this.data.user);
    this.tempUser.profileCompleted = !this.forceCompleteProfile;
    if (this.clientToProfessional) {
      this.tempUser.role = this.userRol.professional;
      this.tempUser.professionalProfileActivated = true;
      this.tempUser.profileCompleted = false;
    }
  }

  goBack() {
    if (this.clientToProfessional) {
      this.notificateNotUpgradeProfile()
    } else {
      this.navController.navigateBack('tabs/profile');
    }
  }

  async notificateNotUpgradeProfile() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert secondary',
      header: 'No se guardarán los cambios',
      message: 'Seguirás teniendo un perfil de cliente, ¿quieres continuar?',
      buttons: [
        {
          text: 'No, ¡espera!',
          role: 'cancel',
        }, {
          cssClass: 'confirm-button',
          text: 'Prefiero seguir como cliente',
          handler: () => this.navController.navigateBack('tabs/profile'),
        }
      ]
    });

    alert.present();
  }

  async updateUser(successMessage?: string, updatedUser?: User) {

    let message
    (await this.loadingController.create()).present();
    if (!updatedUser) updatedUser = this.tempUser;

    try {
      this.tempUser = await this.saveUser(updatedUser);
      this.updateImageProfile = false;
      this.clientToProfessional = false;
      Object.assign(this.data.user, this.tempUser);

      if (!successMessage) {
        message = 'Perfil actualizado';
        if (!this.tempUser.profileCompleted) message += '\naunque faltan algunos datos...';
      } else {
        message = successMessage;
      }

    } catch {
      message = 'Ha ocurrido un error, inténtalo de nuevo';
    }

    const toast = await this.presentToast(message);
    this.leavePageIfPossible(toast);
  }

  async saveUser(updatedUser: User) {
    updatedUser.name_splited = Utils.normalizeAndSplit(updatedUser.name);
    updatedUser.profileCompleted = this.profileIsComplete(updatedUser);
    if (this.updateImageProfile) await this.fStorage.uploadUserProfilePic(updatedUser.profilePic);
    await this.data.updatedMyProfile(updatedUser);
    return updatedUser;
  }

  profileIsComplete(updateUser: User) {
    if (updateUser.role === UserRole.client) {
      return updateUser.addressFull?.length > 0;
    } else if (!updateUser.profileCompleted) {
      const properties = [UserProperties.services, UserProperties.workingHours, UserProperties.coordinates];
      for (const property of properties) if (_.isEmpty(updateUser[property])) return false;
      if (!updateUser.radiusKm) return false;
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
    this.presentInputBottomSheet(this.headerName, UserProperties.name);
  }

  editCompany() {
    this.presentInputBottomSheet(this.headerCompany, UserProperties.companyName, true);
  }

  editAbout() {
    this.presentInputBottomSheet(this.headerAbout, UserProperties.about, true, 'text-area');
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
      cssClass: 'modal',
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
      if (data) this.tempUser.radiusKm = data;
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

  async showDeleteProfessionalProfileAlert() {
    const cssClass = 'custom-alert danger';
    const header = '¿Eliminar perfil profesional?';
    const message = `
    Perderás permanentemente:<br><br>
    - tu perfil profesional<br>
    - tus encargos aceptados como profesional
    `;
    const confirmText = 'Sí, hazme solo cliente';

    this.showAlert(cssClass, header, message, confirmText, this.deleteProfessionalProfile);
  }

  async showDisableProfessionalAccountAlert() {
    const cssClass = 'custom-alert secondary';
    const header = '¿Desactivar perfil profesional?';
    const message = `
    Podrás volver a activarlo cuando quieras.<br>
    Mientras esté desactivado tu perfil no podrá:<br><br>
    - aparecer en las búsquedas<br>
    - recibir peticiones de trabajos<br>
    - aceptar trabajos
    `;
    const confirmText = 'Sí, dame un tiempo';

    this.showAlert(cssClass, header, message, confirmText, this.disableProfessionalProfile);
  }

  async showEnableProfessionalAccountAlert() {
    const cssClass = 'custom-alert primary';
    const header = '¿Activar perfil profesional?';
    const message = `
    ¡Nos alegra verte por aquí!<br>
    Recuerda que una vez actives tu perfil profesional podrás:<br><br>
    - aparecer en las búsquedas<br>
    - recibir peticiones de trabajos<br>
    - aceptar trabajos
    `;
    const confirmText = 'Sí, activa mi perfil';

    this.showAlert(cssClass, header, message, confirmText, this.enableProfessionalProfile);
  }

  async showAlert(cssClass, header, message, confirmText, confirmHandler) {
    const alert = await this.alertController.create({
      cssClass,
      header,
      message,
      buttons: [
        {
          text: 'No, ¡espera!',
          role: 'cancel',
        },
        {
          cssClass: 'confirm-button',
          text: confirmText,
          handler: () => confirmHandler.call(this),
        }
      ]
    });

    alert.present();
  }

  deleteProfessionalProfile() {
    const userClient = new User();
    Object.assign(userClient, this.tempUser);
    userClient.role = this.userRol.client;
    userClient.about = null;
    userClient.companyName = null;
    userClient.professionalProfileActivated = null;
    userClient.radiusKm = null;
    userClient.services = null;
    userClient.workingHours = null;
    this.updateUser('Perfil profesional eliminado', userClient);
  }

  enableProfessionalProfile() {
    this.tempUser.professionalProfileActivated = true;
    this.updateUser('Perfil profesional activado');
  }

  disableProfessionalProfile() {
    this.tempUser.professionalProfileActivated = false;
    this.updateUser('Perfil profesional desactivado');
  }

}
