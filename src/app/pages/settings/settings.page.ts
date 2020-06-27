import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataService } from 'src/app/providers/data.service';
import { tabBarAnimateIn } from 'src/app/animations/tab-bar-transition';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {

  hideLocationAccuracy = false;

  constructor(
    private navController: NavController,
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
    this.hideLocationAccuracy = (await this.data.getMyProfile()).hideLocationAccuracy;
  }

  updateUser() {
    if (this.hideLocationAccuracy != this.data.user.hideLocationAccuracy)
      this.data.updateUserLocationAccuracySetting(this.hideLocationAccuracy);
  }
}
