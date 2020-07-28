import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed, Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { DataService } from '../providers/data.service';
const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  readonly CHANNELS = {
    request: { id: 'selfploy.request', name: 'Encargos' },
    message: { id: 'selfploy.message', name: 'Mensajes' },
  }

  openRequestInfoSubject  = new Subject<string>();
  openConversationSubject = new Subject<{ requestId: string, conversationId: string }>();

  constructor(
    private httpClient: HttpClient,
    private toastController: ToastController,
  ) { }


  register(resolve: (value: string) => void, reject: () => void) {
    if (!Capacitor.isPluginAvailable('PushNotifications')) {
      reject();
      return;
    };

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result => {
      // Register with Apple / Google to receive push via APNS/FCM
      if (result.granted) PushNotifications.register();
    });

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        // alert('Push registration success, token: ' + token.value);
        console.log('Push registration success, token: ' + token.value);

        Object.values(this.CHANNELS).forEach(channel => {
          PushNotifications.createChannel({
            importance : 5,
            name       : channel.name,
            id         : channel.id,
          });
        })

        resolve(token.value);
      }
    );

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', () => reject());

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        this.createLocalNotification(notification);
        // alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {

        const { data } = notification.notification;

        console.log(data)

        switch (data.notification_type) {
          case this.CHANNELS.request.id:
            this.openRequestInfoSubject.next(data.request_id);
            break;
  
          case this.CHANNELS.message.id:
            this.openConversationSubject.next({ requestId: data.request_id, conversationId: data.conversation_id });
            break;
        }

        // alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }


  sendRequestNotification(title: string, body: string, fcmtokens: string[], requestId: string) {
    const postData = {
      registration_ids: fcmtokens,
      notification: {
        title,
        body,
        android_channel_id: this.CHANNELS.request.id,
      },
      data: {
        request_id: requestId,
        notification_type: this.CHANNELS.request.id
      },
    }

    this.send(postData);
  }


  sendMessageNotification(title: string, body: string, fcmtoken: string, requestId: string, conversationId: string) {
    const postData = {
      to: fcmtoken,
      notification: {
        title,
        body,
        android_channel_id: this.CHANNELS.message.id,
      },
      data: {
        request_id: requestId,
        conversation_id: conversationId,
        notification_type: this.CHANNELS.message.id
      },
    }

    this.send(postData);
  }


  send(postData: any) {
    var headers = new HttpHeaders({
      'Authorization': `key=${environment.fcmAuthToken}`,
      'Content-Type': 'application/json'
    });

    this.httpClient
      .post('https://fcm.googleapis.com/fcm/send', postData, { headers })
      .toPromise()
      .then(nice => console.log(nice))
      .catch(meh => console.error(meh));
  }


  async createLocalNotification(notification: PushNotification) {

    (await this.toastController.getTop())?.dismiss();

    if (this.notificationFromCurrentConversation(notification)) return;

    const toast = await this.toastController.create({
      // duration: 5000,
      mode: 'ios',
      header: notification.title,
      message: notification.body,
      color: 'light',
      position: 'top',
      cssClass: 'notification-toast',
      buttons: [
        {
          side: 'end',
          role: 'cancel',
          icon: 'close-outline',
        }
      ]
    })

    toast.addEventListener('click', () => {
      toast.dismiss();
      const { data } = notification;

      switch (data.notification_type) {
        case this.CHANNELS.request.id:
          this.openRequestInfoSubject.next(data.request_id);
          break;

        case this.CHANNELS.message.id:
          this.openConversationSubject.next({ requestId: data.request_id, conversationId: data.conversation_id });
          break;
      }
    })

    toast.shadowRoot.querySelector('button').addEventListener('click', event => event.stopPropagation());
    toast.present();
  }


  notificationFromCurrentConversation({ data }) {
    return (data.notification_type === this.CHANNELS.message.id
      && data.conversation_id === DataService.conversationOpenedList[0]) 
  }

}
