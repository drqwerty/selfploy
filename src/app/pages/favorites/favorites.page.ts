import { Component, OnInit } from '@angular/core';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) { 
      StatusBar.setStyle({ style: StatusBarStyle.Dark })
    };
  }

}
