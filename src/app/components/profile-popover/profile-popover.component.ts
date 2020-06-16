import { Component } from '@angular/core';
import { AlertController, Platform, PopoverController, NavController } from '@ionic/angular';
import { playLogoutAnimation } from "../../animations/log-in-out-transition";
import { tabBarAnimateOut } from "../../animations/tab-bar-transition";

import { Plugins, StatusBarStyle } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-profile-popover',
  templateUrl: './profile-popover.component.html',
  styleUrls: ['./profile-popover.component.scss'],
})
export class ProfilePopoverComponent {

  currentPopover: HTMLIonPopoverElement;

  constructor(
    private popoverController: PopoverController,
    private auth: AuthService,
    private alertController: AlertController,
    private platform: Platform,
    private navController: NavController,
  ) {
    popoverController.getTop().then(el => this.currentPopover = el)
  }

  async editProfile() {
    this.currentPopover.animated = false;
    await this.popoverController.dismiss();
    tabBarAnimateOut();
    this.navController.navigateForward('tabs/profile/edit', { state: { forceCompleteProfile: false } });
  }

  async editSettings() {
    this.currentPopover.animated = false;
    await this.popoverController.dismiss();
    tabBarAnimateOut();
    this.navController.navigateForward('tabs/profile/settings', { state: { forceCompleteProfile: false } });
  }

  async logout() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert danger',
      header: 'Cerrar sesión',
      message: 'Se cerrará la sesión actual, ¿quieres continuar?',
      buttons: [
        {
          text: 'No, ¡espera!',
          role: 'cancel',
        }, {
          cssClass: 'confirm-button',
          text: 'Cerrar sesión',
          handler: async () => {
            await this.popoverController.dismiss();
            StatusBar.setStyle({ style: StatusBarStyle.Dark });
            this.auth.logout();
            await playLogoutAnimation(this.platform.height());
            this.navController.navigateRoot('main', { animated: false });
          }
        }
      ]
    });

    await alert.present();
  }



}
