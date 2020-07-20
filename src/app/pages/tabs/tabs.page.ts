import { Component, ViewChild, } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { playLoginAnimation } from "../../animations/log-in-out-transition";

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { RequestNewComponent } from 'src/app/components/modals/as-pages/request-new/request-new.component';
import { Animations } from 'src/app/animations/animations';
import { DataService } from 'src/app/providers/data.service';
import { NotificationService } from 'src/app/services/notification.service';
import { takeUntil } from 'rxjs/operators';
import { RequestInfoComponent } from 'src/app/components/modals/as-pages/request-info/request-info.component';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage {

  ionFab: HTMLIonFabElement;

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

  constructor(
    private platform: Platform,
    private modalController: ModalController,
    private anim: Animations,
    private data: DataService,
    private notifications: NotificationService,
  ) {
    setTimeout(async () => {
      await playLoginAnimation(platform.height())
      this.ionFab = document.querySelector('ion-fab');
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light })
      // this.requestNewService();
    }, 500);
    this.data.saveFCMToken();

    notifications.openRequestInfoSubject
      .pipe(takeUntil(data.userLogout))
      .subscribe(async requestId => {

        const request = await data.getRequest(requestId);

        if (request) {
          const modal = await this.modalController.create({
            component: RequestInfoComponent,
            componentProps: { request }
          });

          await modal.present();
        }
      });
  }


  ionViewWillEnter() {
    this.data.observeMyRequests();
    this.data.observeFollowingRequests();
    this.data.observeMyConversations();
  }


  async requestNewService() {
    const modal = await this.modalController.create({
      component: RequestNewComponent,
      animated: false,
    });

    // await this.anim.addElement(this.ionFab).startAnimation();
    modal.onWillDismiss().then(() => modal.classList.remove('background-black'));
    modal.present().then(() => modal.classList.add('background-black'));
  }

}
