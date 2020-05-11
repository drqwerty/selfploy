import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage {

  @ViewChild('backgroundImage', { static: false }) backgroundImage: ElementRef;
  @ViewChild('background', { static: false }) background: ElementRef;

  backgroundAnimation: Animation;


  constructor(
    private navController: NavController,
    private platform: Platform,
  ) { }


  ionViewDidEnter() {

    if (!this.backgroundAnimation) this.createAnimations();
    this.playBackgroundAnimation(true);
  }


  continueWithEmail() {

    this.playBackgroundAnimation()
      .then(() => {
        this.navController.navigateForward('login-email', { animated: false });
      });
  }

  continueWithGoogle() {
  }

  continueWithFacebook() {
  }


  playBackgroundAnimation(reverse = false): Promise<void> {

    const direction = reverse ? 'reverse' : 'normal';
    const easing    = reverse ? 'ease-in' : 'ease-out';

    return this.backgroundAnimation
      .direction(direction)
      .easing(easing)
      .play();
  }


  createAnimations() {

    const elements = [this.backgroundImage, this.background];

    const animations = elements.map(element =>
      createAnimation()
        .addElement(element.nativeElement)
        .fromTo('transform', 'translateY(0px)', `translateY(${this.platform.height()}px)`)
    );

    this.backgroundAnimation = createAnimation()
      .duration(500)
      .addAnimation(animations);
  }

}
