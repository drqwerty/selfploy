import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavController, Platform } from '@ionic/angular';
import { createAnimation } from '@ionic/core';

import { Plugins, StatusBarStyle } from '@capacitor/core';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {

  constructor(
    private AF: AuthService,
    private nav: NavController,
    private platform: Platform
  ) { }

  firstTime = true;

  ngOnInit() {
  }

  ionViewWillEnter() {
    if (!this.firstTime) StatusBar.setStyle({ style: StatusBarStyle.Light });
    this.firstTime = false;
  }

  onClick() {
    this.AF.logout();
    StatusBar.setStyle({ style: StatusBarStyle.Dark });
    this.playAnimation().then(() => this.nav.navigateRoot('main', { animated: false }));
  }

  playAnimation() {
    const a = document.querySelector('.background-animation-wrapper > .background');
    const b = document.querySelector('.background-animation-wrapper > .backgroundImage');
    const totalHeight = b.getBoundingClientRect().height + this.platform.height();
    const elements = [a, b];
    const animations = elements.map(element =>
      createAnimation()
        .addElement(element)
        .fromTo('transform', `translateY(-${totalHeight}px)`, `translateY(0)`)
    );
    return createAnimation()
      .duration(600)
      .addAnimation(animations)
      .easing('ease-out')
      .play();
  }
}
