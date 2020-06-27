import { Component, Input, ViewChild } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { ProfileViewComponent } from 'src/app/components/templates/profile-view/profile-view.component';
import { ModalController } from '@ionic/angular';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { DataService } from 'src/app/providers/data.service';
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
  isFav = false;

  constructor(
    private modalController: ModalController,
    private data: DataService,
  ) { }

  ionViewWillEnter() {
    this.profileView.startProfileImageIntersectionObserver();
    this.isFav = this.user.isFav ?? false;
  }

  ionViewDidEnter() {
    this.profileView.initMap()
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
  }

  ionViewWillLeave() {
    this.profileView.stopProfileImageIntersectionObserver();
    this.toggleFav();
  }

  goBack() {
    this.modalController.dismiss();
  }

  scrollEvent({ deltaY }) {
    this.collapsedFab = 0 < deltaY;
  }

  toggleIcon() {
    this.isFav = !this.isFav;
  }

  toggleFav() {
    if (this.user.isFav !== this.isFav) {
      if (this.isFav) this.data.saveFavorite(this.user);
      else this.data.removeFavorite(this.user);
    }


    /**
    *   
    *   logica para :
    *   guardar en local ordenado POR NOMBRE
    *   subir a firebase con la siguinte estructura 
    *   favorites
    *     |
    *     |-uid: {uid: true, uid: true, uid: true}
    *     |
    *     |-uid
    *     |
    *     |-uid
    * 
    *  array de ids 
    * mapear con un snapshot de firestore
    * coger este array y esperar con un promise all
    * tenemos usuarios! 
    * 
    */
  }

}
