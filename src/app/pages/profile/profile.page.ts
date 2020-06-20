import { Component, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { User, UserRole } from 'src/app/models/user-model';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { PopoverController, NavController } from '@ionic/angular';
import { ProfilePopoverComponent } from 'src/app/components/profile-popover/profile-popover.component';
import { MapPreviewComponent } from 'src/app/components/map-preview/map-preview.component';
import { DataService } from 'src/app/providers/data.service';
import { tabBarAnimateOut } from "../../animations/tab-bar-transition";
const { StatusBar } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  @ViewChild(MapPreviewComponent) mapPreview: MapPreviewComponent;

  userRol = UserRole;
  user: User;
  backgroundColor: string;

  constructor(
    private storage: StorageService,
    private popoverController: PopoverController,
    private navController: NavController,
    private data: DataService,
  ) {
    storage.getUserProfile().then(user => {
      this.user = data.user = user;
      this.backgroundColor = this.user.role === this.userRol.client ? 'secondary' : 'primary';
    });
  }

  ionViewWillEnter() {
    if (this.user && this.user !== this.data.user) this.user = this.data.user;
    this.backgroundColor = this.user.role === this.userRol.client ? 'secondary' : 'primary';
    if (Capacitor.isPluginAvailable('StatusBar')) { 
    StatusBar.setStyle({ style: StatusBarStyle.Dark });
    };
  }

  ionViewDidEnter() {
    this.mapPreview?.initMap();
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
