import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { User } from 'src/app/models/user-model';
import { DataService } from 'src/app/providers/data.service';
import { StorageService } from 'src/app/services/storage.service';
import { tabBarAnimateIn } from 'src/app/animations/tab-bar-transition';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  tempUser: User;

  hideLocationAccuracy = false;

  constructor(
    private navController: NavController,
    private storage: StorageService,
    private firestoreService: FirestoreService,
    private data: DataService,
  ) { }

  ionViewWillEnter() {
    this.getUser();
  }

  ionViewWillLeave() {
    this.updateUser();
    tabBarAnimateIn();
  }

  goBack() {
    this.navController.pop();
  }

  async getUser() {
    this.tempUser = new User();
    if (!this.data.user) this.data.user = await this.storage.getUserProfile();
    this.hideLocationAccuracy = this.data.user.hideLocationAccuracy;
    Object.assign(this.tempUser, this.data.user);
  }

  updateUser() {
    if (this.hideLocationAccuracy != this.tempUser.hideLocationAccuracy) {
      this.data.user.hideLocationAccuracy = this.hideLocationAccuracy;
      this.firestoreService.updateUserLocationAccuracySetting(this.hideLocationAccuracy);
      this.storage.saveUserProfile(this.tempUser);
    }
  }
}
