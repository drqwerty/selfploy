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
  ) {
    const goBackSubscription = platform.backButton.subscribe(() => {
      goBackSubscription.unsubscribe();
      tabBarAnimateIn();
    })
  }

  ionViewWillEnter() {
    this.storage.getUserProfile().then(user => this.user = user);
    tabBarAnimateOut();
    StatusBar.setStyle({ style: StatusBarStyle.Light })
  }

  goBack() {
    tabBarAnimateIn();
    this.navController.pop();
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

  async editName() {
    const modal = await this.createInputBottomSheet(
      this.headerName,
      this.user.name,
    );

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.user.name = data.value
    });

    modal.present();
  }

  async editCompany() {
    const modal = await this.createInputBottomSheet(
      this.headerCompany,
      this.user.companyName,
    );

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.user.companyName = data.value
    });

    modal.present();
  }

  async editAbout() {
    const modal = await this.createInputBottomSheet(
      this.headerAbout,
      this.user.about,
      'text-area',
    );

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.user.about = data.value
    });

    modal.present();
  }

  createInputBottomSheet(title, formState, type: 'input' | 'text-area' = 'input') {
    return this.modalController.create({
      component: InputBottomSheetComponent,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        type,
        title,
        form: this.formBuilder.group({
          value: new FormControl(formState, [
            Validators.required,
            Validators.minLength(3),
          ]),
        })
      },
    });
  }


}
