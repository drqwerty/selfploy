import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed, Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
const { PushNotifications } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  readonly REQUEST_CHANNEL_ID = 'selfploy.request';
  readonly REQUEST_CHANNEL_NAME = 'Encargos';
  readonly CHAT_CHANNEL_ID = 'selfploy.message';
  readonly CHAT_CHANNEL_NAME = 'Mensajes';

  constructor(
    private httpClient: HttpClient,
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
        alert('Push received: ' + JSON.stringify(notification));
      }
    );

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        alert('Push action performed: ' + JSON.stringify(notification));
      }
    );
  }

  send(title: string, body: string, fcmtokens: string[]) {
    const postData = {
      registration_ids: fcmtokens,
      notification: {
        title,
        body,
        android_channel_id: this.REQUEST_CHANNEL_ID,
      },
      data: {
        title,
        body
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

}
