import { Component } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { User, UserRole } from 'src/app/models/user-model';

import { Plugins, StatusBarStyle } from '@capacitor/core';
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
    private storage: StorageService
  ) {
    storage.getUserProfile().then(user => {
      this.brackgroundColor = user.role === this.userRol.client ? 'secondary' : 'primary';
      this.user = user;
    });
  }

  ionViewWillEnter() {
    StatusBar.setStyle({ style: StatusBarStyle.Dark })
  }

}
