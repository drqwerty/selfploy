import { Component } from '@angular/core';
import { NavController, Platform, ModalController, ToastController } from '@ionic/angular';
import { tabBarAnimateIn, tabBarAnimateOut } from "src/app/animations/tab-bar-transition";

import { Plugins, StatusBarStyle } from '@capacitor/core';
import { User, UserRole } from 'src/app/models/user-model';
import { StorageService } from 'src/app/services/storage.service';
import { InputBottomSheetComponent } from 'src/app/components/input-bottom-sheet/input-bottom-sheet.component';
import { CameraSourceActionSheetComponent } from 'src/app/components/camera-source-action-sheet/camera-source-action-sheet.component';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
const { StatusBar } = Plugins;

import { ModalAnimationSlideWithOpacityEnter, ModalAnimationSlideWithOpacityLeave } from 'src/app/animations/page-transitions';
import { ServicePickerComponent } from 'src/app/components/service-picker/service-picker.component';
import { WorkingHoursPickerComponent } from 'src/app/components/working-hours-picker/working-hours-picker.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { MapLocationComponent } from 'src/app/components/map-location/map-location.component';
import { MapRangeComponent } from 'src/app/components/map-range/map-range.component';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage {

  user: User;
  userRol = UserRole;

  profilePicWithoutCrop: any;
  removePictureToast: HTMLIonToastElement;

  headerName = 'Nombre completo';
  headerCompany = 'Empresa';
  headerAbout = 'Sobre mí'


  constructor(
    private navController: NavController,
    private platform: Platform,
    private storage: StorageService,
    private modalController: ModalController,
    private toastController: ToastController,
    private formBuilder: FormBuilder,
    private firestoreService: FirestoreService,
  ) {
    const goBackSubscription = platform.backButton.subscribe(() => {
      goBackSubscription.unsubscribe();
      tabBarAnimateIn();
    })
  }

  ionViewWillEnter() {
    this.storage.getUserProfile().then(user => this.user = user);
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

  updateUser() {
    this.storage.saveUserProfile(this.user);
    this.firestoreService.updateUserProfile(this.user)
      .then(t => console.log('t', t))
      .catch(c => console.log('c', c));
  }

  async showCameraSourcePrompt() {
    this.removePictureToast?.dismiss();
    const modal = await this.modalController.create({
      component: CameraSourceActionSheetComponent,
      cssClass: 'action-sheet',
      componentProps: {
        showRemoveButton: this.user.profilePic != null,
        profilePic: this.profilePicWithoutCrop ?? this.user.profilePic,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      this.profilePicWithoutCrop = data?.profilePicWithoutCrop;
      if (data?.image) this.user.profilePic = data.image;
      else if (data?.remove) this.removeProfileImage();
    });

    modal.present();
  }

  async removeProfileImage() {
    const profileImageTemp = this.user.profilePic;
    this.user.profilePic = null;

    this.removePictureToast = await this.toastController.create({
      message: 'Foto eliminada',
      duration: 3000,
      mode: 'ios',
      position: 'bottom',
      buttons: [{
        side: 'end',
        text: 'Deshacer',
        handler: () => { this.user.profilePic = profileImageTemp; }
      }]
    });
    this.removePictureToast.present();
  }

  editName() {
    this.presentInputBottomSheet(this.headerName, 'name');
  }

  editCompany() {
    this.presentInputBottomSheet(this.headerCompany, 'companyName');
  }

  editAbout() {
    this.presentInputBottomSheet(this.headerAbout, 'about', 'text-area');
  }

  async editServices() {
    const modal = await this.modalController.create({
      component: ServicePickerComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityLeave,
      componentProps: { userServices: this.user.services }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.user.services = data;
    });

    modal.present();
  }

  async editWorkingHours() {
    const modal = await this.modalController.create({
      component: WorkingHoursPickerComponent,
      cssClass: 'modal-working-hours',
      componentProps: { userWorkingHours: this.user.workingHours }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.user.workingHours = data;
    });

    modal.present();
  }

  async editLocation() { 
    const modal = await this.modalController.create({
      component: MapLocationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityLeave,
      componentProps: {
        hideLocationAccuracy: this.user.hideLocationAccuracy,
        addressFull: this.user.addressFull,
        addressCity: this.user.addressCity,
        coordinates: this.user.coordinates,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        this.user.hideLocationAccuracy = data.hideLocationAccuracy;
        this.user.addressFull = data.addressFull;
        this.user.addressCity = data.addressCity;
        this.user.coordinates = data.coordinates;
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
        coordinates: this.user.coordinates,
        radiusKm: this.user.radiusKm,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        console.log(data);
        this.user.radiusKm = data
      }
    });

    modal.present();
  }

  async presentInputBottomSheet(title, userProperty, type: 'input' | 'text-area' = 'input') {
    const modal = await this.modalController.create({
      component: InputBottomSheetComponent,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        type,
        title,
        form: this.formBuilder.group({
          value: new FormControl(this.user[userProperty], [
            Validators.required,
            Validators.minLength(3),
          ]),
        })
      },
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.user[userProperty] = data.value
    });

    modal.present();
  }

}
