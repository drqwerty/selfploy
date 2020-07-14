import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed, Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';
import { Request } from 'src/app/models/request-model';
import { Subject } from 'rxjs';
const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  readonly REQUEST_CHANNEL_ID = 'selfploy.request';
  readonly REQUEST_CHANNEL_NAME = 'Encargos';
  readonly CHAT_CHANNEL_ID = 'selfploy.message';
  readonly CHAT_CHANNEL_NAME = 'Mensajes';

  openRequestInfoSubject = new Subject<string>();

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

        PushNotifications.createChannel({
          id: this.REQUEST_CHANNEL_ID,
          name: this.REQUEST_CHANNEL_NAME,
          importance: 5
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
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  send(title: string, body: string, fcmtokens: string[], requestId: string) {
    const postData = {
      registration_ids: fcmtokens,
      notification: {
        title,
        body,
        android_channel_id: this.REQUEST_CHANNEL_ID,
      },
      data: {
        request_id: requestId
      },
    }

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
      this.openRequestInfoSubject.next(notification.data.request_id);
    })

    toast.shadowRoot.querySelector('button').addEventListener('click', event => event.stopPropagation());
    toast.present();
  }

}
