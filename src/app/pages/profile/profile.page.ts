import { Component, ViewChild } from '@angular/core';
import { User, UserRole } from 'src/app/models/user-model';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { PopoverController, NavController } from '@ionic/angular';
import { ProfilePopoverComponent } from 'src/app/components/popovers/profile-popover/profile-popover.component';
import { tabBarAnimateOut } from "src/app/animations/tab-bar-transition";
import { ProfileViewComponent } from 'src/app/components/templates/profile-view/profile-view.component';
import { DataService } from 'src/app/providers/data.service';
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
    private data: DataService,
    private popoverController: PopoverController,
    private navController: NavController,
  ) {
    this.data.getMyProfile().then(user => this.user = user);
  }


  async ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
    this.user = await this.data.getMyProfile();
    this.updateBackgroundColor();
    this.profileView.startProfileImageIntersectionObserver();
    if (this.user.role === UserRole.professional) this.profileView.getTotalNumberCompletedRequests();
  }


  ionViewDidEnter() {
    this.profileView.initMap();
  }


  ionViewWillLeave() {
    this.profileView.stopProfileImageIntersectionObserver();
  }


  updateBackgroundColor() {
    this.backgroundColor = this.user.role === this.userRol.client ? 'secondary' : 'primary';
    this.profileView.setCornersStyle();
  }


  async presentPopover(event: MouseEvent) {
    const popover = await this.popoverController.create({
      component: ProfilePopoverComponent,
      event,
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
