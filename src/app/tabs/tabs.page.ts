import { Component, ViewChild, ElementRef } from '@angular/core';
import { createAnimation, Animation } from '@ionic/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {

  @ViewChild('background') background: ElementRef;
  @ViewChild('backgroundImage') backgroundImage: ElementRef;

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
    this.playAnimation();
  }


  playAnimation() {

    setTimeout(() => {

      const totalHeight = (this.backgroundImage.nativeElement as HTMLDivElement).getBoundingClientRect().height + this.platform.height();

      const elements = [this.backgroundImage, this.background];
      const animations = elements.map(element =>
        createAnimation()
          .addElement(element.nativeElement)
          .fromTo('transform', 'translateY(0)', `translateY(-${totalHeight}px)`)
      );

      createAnimation()
        .duration(600)
        .addAnimation(animations)
        .easing('ease-out')
        .play();

    }, 500);


  }
}
