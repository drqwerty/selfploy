import { Component } from '@angular/core';
import { NavController, Platform, ModalController, ToastController, LoadingController } from '@ionic/angular';
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

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage {

  tempUser: User;
  userRol = UserRole;

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
    private platform: Platform,
    private storage: StorageService,
    private modalController: ModalController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreService,
    private fStorage: FirebaseStorage,
    private data: DataService,
  ) {
    const goBackSubscription = platform.backButton.subscribe(() => {
      goBackSubscription.unsubscribe();
      tabBarAnimateIn();
    })
  }

  ionViewWillEnter() {
    this.tempUser = new User();
    Object.assign(this.tempUser, this.data.user);
    tabBarAnimateOut();
    StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewDidEnter() {
    // this.editLocation();
  }

  goBack() {
    tabBarAnimateIn();
    this.navController.pop();
  }

  async updateUser() {

    let message, toast;

    // (await this.loadingController.create()).present();

    try {
      if (this.updateImageProfile) await this.fStorage.uploadUserProfilePic(this.tempUser.profilePic);
      await this.firestoreService.updateUserProfile(this.tempUser)
      this.storage.saveUserProfile(this.tempUser);
      message = 'Perfil actualizado';
      Object.assign(this.data.user, this.tempUser);
      this.updateImageProfile = false;
    } catch (error) {
      message = 'Ha ocurrido un error, inténtalo de nuevo';
    }

    await Promise.all([
      // this.loadingController.dismiss(),
      this.toastController.create({
        message,
        duration: 2000,
        mode: 'ios',
        cssClass: 'ion-text-center',
      }).then(htmlToast => toast = htmlToast),
    ]);

    toast.present();
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
      this.profilePicWithoutCrop = data?.profilePicWithoutCrop;
      this.updateImageProfile = data?.image;
      if (data?.image) {
        this.tempUser.hasProfilePic = true;
        this.tempUser.profilePic = data.image;
      } else if (data?.remove) { this.removeProfileImage(); }
    });

    modal.present();
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

}
