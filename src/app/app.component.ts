import { Component, NgZone, ViewChild } from '@angular/core';
import { Platform, IonApp } from '@ionic/angular';
import { Router } from '@angular/router';
import { registerWebPlugin, StatusBarStyle, KeyboardInfo, Capacitor } from '@capacitor/core';
import { FacebookLogin } from '@rdlabo/capacitor-facebook-login';
import { AngularFireAuth } from '@angular/fire/auth';
import { Plugins } from '@capacitor/core';
const { StatusBar, SplashScreen, Keyboard, StatusBarPlugin } = Plugins;
import * as moment from 'moment';
import 'moment/locale/es';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  @ViewChild(IonApp) ionApp: any;
  marginBottom = 0;
  firstLogin = true;

  constructor(
    private platform: Platform,
    private router: Router,
    private aFAuth: AngularFireAuth,
    private zone: NgZone, 
  ) {
    registerWebPlugin(FacebookLogin);
    this.initializeApp();
  }

  initializeApp() {
    const isAndroid = this.platform.is('capacitor') && this.platform.is('android');
    if (isAndroid) {
      this.keyboadListener();
      this.getStatusBarHeight();
    }
    this.platform.ready().then(() => {
      SplashScreen.hide();
      moment.locale("es");
      if (isAndroid) this.setStatusBarTransparent();
      this.authObserver();
    });
  }

  setStatusBarTransparent() {
    if (Capacitor.isPluginAvailable('StatusBar')) {
      StatusBar.setStyle({ style: StatusBarStyle.Dark });
      StatusBar.setBackgroundColor({ color: '#ffffff' });
      StatusBar.setOverlaysWebView({ overlay: true });
    }
  }

  async authObserver() {
    const unsubscribe = await this.aFAuth.onAuthStateChanged(authenticated => {

      if (this.firstLogin) {
        this.firstLogin = false;
        const page = authenticated ? 'tabs' : 'main';
        this.zone.run(() => this.router.navigateByUrl(page));
      }

      if (authenticated) unsubscribe();
    });
  }

  keyboadListener() {
    Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
      setTimeout(() => document.activeElement.scrollIntoView({ behavior: "smooth" }), 100);
    });

    Keyboard.addListener('keyboardWillHide', () =>
      document.body.style.removeProperty('--keyboard-height')
    );
  }

  getStatusBarHeight() {
    StatusBarPlugin.getHeight().then(data =>
      document.documentElement.style.setProperty('--status-bar-height', `${data.value}px`)
    );
  }
}
