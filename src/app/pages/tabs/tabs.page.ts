import { Component, } from '@angular/core';
import { Platform } from '@ionic/angular';
import { playLoginAnimation } from "../../animations/log-in-out-transition";

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {

  tabs = [
    {
      path: 'categories',
      icon: 'home-outline',
    },
    {
      path: 'request-list',
      icon: 'clipboard-outline',
    },
    {
      path: 'favorites',
      icon: 'heart-outline',
    },
    {
      path: 'profile',
      icon: 'person-circle-outline',
    },
  ];

  constructor(private platform: Platform) {
    setTimeout(async () => {
      await playLoginAnimation(platform.height())
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light })
    }, 500);
  }

}
