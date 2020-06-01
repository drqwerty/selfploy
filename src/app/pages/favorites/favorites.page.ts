import { Component, OnInit } from '@angular/core';

import { Plugins, StatusBarStyle } from '@capacitor/core';
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
    StatusBar.setStyle({ style: StatusBarStyle.Dark })
  }

}
