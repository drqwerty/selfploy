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

  @ViewChild('background', { static: false }) background: ElementRef;

  backgroundAnimation: Animation;


  constructor(
    private navController: NavController,
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

    this.backgroundAnimation = createAnimation()
      .addElement(this.background.nativeElement)
      .delay(1000)
      .fromTo('transform', 'translateY(-100%)', `translateY(0)`)
      .duration(500);
  }

}
