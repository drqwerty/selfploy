import { Component, Input, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { ProfileViewComponent } from 'src/app/components/templates/profile-view/profile-view.component';
import { ModalController } from '@ionic/angular';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileModalComponent {

  @Input() backgroundColor: string;
  @Input() user: User;


  @ViewChild(ProfileViewComponent) profileView: ProfileViewComponent;

  collapsedFab = false;

  constructor(
    private modalController: ModalController,
  ) { }

  ionViewWillEnter() {
    this.profileView.startProfileImageIntersectionObserver();
  }

  ionViewDidEnter() {
    this.profileView.initMap()
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
  }

  ionViewWillLeave() {
    this.profileView.stopProfileImageIntersectionObserver();
  }

  goBack() {
    this.modalController.dismiss();
  }

  scrollEvent({ deltaY }) {
    this.collapsedFab = 0 < deltaY;
  }

}
