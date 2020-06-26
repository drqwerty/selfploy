import { Component, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { User, UserRole } from 'src/app/models/user-model';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { PopoverController, NavController } from '@ionic/angular';
import { ProfilePopoverComponent } from 'src/app/components/popovers/profile-popover/profile-popover.component';
import { tabBarAnimateOut } from "../../animations/tab-bar-transition";
import { ProfileViewComponent } from 'src/app/components/templates/profile-view/profile-view.component';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  @ViewChild(ProfileViewComponent) profileView: ProfileViewComponent;

  userRol = UserRole;
  user: User;
  backgroundColor: string;

  constructor(
    private storage: StorageService,
    private popoverController: PopoverController,
    private navController: NavController,
  ) { }

  async ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
    this.profileView.startProfileImageIntersectionObserver();
    this.user = await this.storage.getUserProfile();
    this.updateBackgroundColor();
  }

  ionViewDidEnter() {
    this.profileView.initMap()
  }

  ionViewWillLeave() {
    this.profileView.stopProfileImageIntersectionObserver();
  }

  updateBackgroundColor() {
    this.backgroundColor = this.user.role === this.userRol.client ? 'secondary' : 'primary';
    this.profileView.setCornersStyle();
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ProfilePopoverComponent,
      event: ev,
    });
    return await popover.present();
  }

  createProfessionalProfile() {
    tabBarAnimateOut();
    this.navController.navigateForward('tabs/profile/edit', {
      state: {
        forceCompleteProfile: true,
        clientToProfessional: true,
      }
    });
  }

  activateProfessionalProfile() {
    this.navController.navigateForward('tabs/profile/edit', {
      state: {
        forceCompleteProfile: false,
        activeProfessionalProfile: true,
      }
    });
  }

}
