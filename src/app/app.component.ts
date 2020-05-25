import { Component, NgZone } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

import { registerWebPlugin } from '@capacitor/core';
import { FacebookLogin } from '@rdlabo/capacitor-facebook-login';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  firstLogin = true;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private AFauth: AngularFireAuth,
    private zone: NgZone,

  ) {
    registerWebPlugin(FacebookLogin);
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      const unsubscribe = await this.AFauth.onAuthStateChanged(authenticated => {

        if (this.firstLogin) {
          this.firstLogin = false;
          const page = authenticated ? 'tabs' : 'main';
          this.zone.run(() => this.router.navigateByUrl(page));
        }

        if (authenticated) unsubscribe();
      });
    });
  }
}
