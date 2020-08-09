import { Component, } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { playLoginAnimation } from "../../animations/log-in-out-transition";

import { Plugins, StatusBarStyle, Capacitor, StatusBarStyleOptions } from '@capacitor/core';
import { RequestNewComponent } from 'src/app/components/modals/as-pages/request-new/request-new.component';
import { Animations } from 'src/app/animations/animations';
import { DataService } from 'src/app/providers/data.service';
import { NotificationService } from 'src/app/services/notification.service';
import { takeUntil } from 'rxjs/operators';
import { RequestInfoComponent } from 'src/app/components/modals/as-pages/request-info/request-info.component';
import { ConversationComponent } from 'src/app/components/modals/as-pages/conversation/conversation.component';
import { Request } from 'src/app/models/request-model';
import { Conversation } from 'src/app/models/conversation-model';
import { Router } from '@angular/router';
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
    private router: Router
  ) {
    setTimeout(async () => {
      await playLoginAnimation(platform.height())
      this.ionFab = document.querySelector('ion-fab');
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light })
      // this.requestNewService();
    }, 500);
    this.data.saveFCMToken();

    this.suscribeNotifications();
  }


  ionViewWillEnter() {
    this.data.observeMyRequests();
    this.data.observeFollowingRequests();
    this.data.observeMyConversations();
  }


  suscribeNotifications() {
    this.notifications.openRequestInfoSubject
      .pipe(takeUntil(this.data.userLogout))
      .subscribe(async requestId => {

        let request: Request = await this.data.getRequest(requestId);

        if (request) {
          this.openRequest(request);

        } else {
          let i = 1;
          const interval = setInterval(async () => {
            request = await this.data.getRequest(requestId);
            if (request || i > 5) {
              clearInterval(interval);
              this.openRequest(request);
            }
            i++;
          }, 250);
        }

      });


    this.notifications.openConversationSubject
      .pipe(takeUntil(this.data.userLogout))
      .subscribe(async ({ conversationId }) => {

        let conversation: Conversation = this.data.getConversationFromId(conversationId);

        if (conversation) {
          this.openConversation(conversation)

        } else {
          let i = 1;
          const interval = setInterval(async () => {
            conversation = this.data.getConversationFromId(conversationId);
            if (conversation || i > 5) {
              clearInterval(interval);
              this.openConversation(conversation);
            }
            i++;
          }, 250);
        }

      });
  }


  async openRequest(request: Request) {
    const modal = await this.modalController.create({
      component: RequestInfoComponent,
      componentProps: { request }
    });

    await modal.present();
  }


  async openConversation(conversation: Conversation) {
    const modal = await this.modalController.create({
      component: ConversationComponent,
      componentProps: {
        requestId: conversation.request,
        partnerId: conversation.anotherUser.id
      }
    });

    await modal.present();
  }


  async requestNewService() {
    const modal = await this.modalController.create({
      component: RequestNewComponent,
      animated: false,
    });

    let style: 0 | 1;
    const statusBarStyles: StatusBarStyleOptions[] = [
      { style: StatusBarStyle.Dark },
      { style: StatusBarStyle.Light }
    ];

    const currentPage = this.router.parseUrl(this.router.url).root.children.primary.segments[1].path;
    style = (currentPage == 'profile')
      ? 0
      : 1;

    await this.anim.addElement(this.ionFab).startAnimation();

    modal.onWillDismiss().then(() => {
      modal.classList.remove('background-black');
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle(statusBarStyles[style]);
    });

    modal.present().then(() => {
      modal.classList.add('background-black');
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle(statusBarStyles[1]);
    });
  }

}
