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
export class ProfileModalComponent  {

  @Input() backgroundColor: string;
  @Input() user: User;


  @ViewChild(ProfileViewComponent) profileView: ProfileViewComponent;

  constructor(
    private modalController: ModalController,
  ) { }

  ionViewDidEnter() {
    this.profileView.initMap()
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
  }

  goBack() {
    this.modalController.dismiss();
  }

}
