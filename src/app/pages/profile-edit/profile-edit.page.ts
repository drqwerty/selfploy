import { Component } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { tabBarAnimateIn } from "../../animations/tab-bar-transition";

import { Plugins, StatusBarStyle } from '@capacitor/core';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
})
export class ProfileEditPage {

  constructor(
    private navController: NavController,
    private platform: Platform,
  ) {
    const goBackSubscription = platform.backButton.subscribe(() => {
      goBackSubscription.unsubscribe();
      tabBarAnimateIn();
    })
  }

  ionViewWillEnter() {
    StatusBar.setStyle({ style: StatusBarStyle.Light })
  }

  goBack() {
    tabBarAnimateIn();
    this.navController.pop();
  }

}
