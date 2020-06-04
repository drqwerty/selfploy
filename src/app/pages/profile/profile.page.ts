import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { User, UserRole } from 'src/app/models/user-model';

import { Plugins, StatusBarStyle } from '@capacitor/core';
import { PopoverController } from '@ionic/angular';
import { ProfilePopoverComponent } from 'src/app/components/profile-popover/profile-popover.component';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

  userRol = UserRole;
  user: User;
  brackgroundColor: string;

  constructor(
    private storage: StorageService,
    private popoverController: PopoverController,
  ) {
    storage.getUserProfile().then(user => {
      this.brackgroundColor = user.role === this.userRol.client ? 'secondary' : 'primary';
      this.user = user;
    });
  }

  ionViewWillEnter() {
    StatusBar.setStyle({ style: StatusBarStyle.Dark })
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: ProfilePopoverComponent,
      event: ev,
    });
    return await popover.present();
  }

}
