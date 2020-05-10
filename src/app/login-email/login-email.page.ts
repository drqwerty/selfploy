import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, IonContent, IonFooter, IonToolbar } from '@ionic/angular';
import { createAnimation, Animation } from '@ionic/core';

@Component({
  selector: 'app-login-email',
  templateUrl: './login-email.page.html',
  styleUrls: ['./login-email.page.scss'],
})
export class LoginEmailPage {

  @ViewChild('content', { static: false }) content: ElementRef;
  @ViewChild('backButton', { static: false }) backButton: ElementRef;
  @ViewChild('continueButton', { static: false }) continueButton: ElementRef;

  animation: Animation;


  constructor(
    private navCtrl: NavController,
  ) { }


  ionViewWillEnter() {
    
    this.createAnimations();
    this.animation.direction('normal').play();
  }


  goBack() {

    this.animation.direction('reverse').play()
      .then(() =>
        this.navCtrl.navigateBack('main', { animated: false })
      );
  }


  createAnimations() {

    if (this.animation != null) return;

    const elements = [this.content, this.backButton, this.continueButton];

    const animations = elements.map(element =>
      createAnimation()
        .addElement(element.nativeElement)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateY(-5px)', 'translateY(0px)')
    )

    this.animation = createAnimation()
      .duration(200)
      .addAnimation(animations);
  }

}
