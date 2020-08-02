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

  @Input() selectingProfessionals = false;
  @Input() backgroundColor: string;
  @Input() user: User;
  @Input() completedRequests: number;
  @Input() reviewStats: { avg: number, reviews: number };


  @ViewChild(ProfileViewComponent) profileView: ProfileViewComponent;

  collapsedFab = false;
  isFav = false;

  constructor(
    private modalController: ModalController,
    private data: DataService,
  ) { }


  ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
    this.profileView.startProfileImageIntersectionObserver();
    this.isFav = this.user.isFav ?? false;
  }


  ionViewDidEnter() {
    this.profileView.initMap();
  }


  ionViewWillLeave() {
    this.profileView.stopProfileImageIntersectionObserver();
    this.toggleFav();
  }


  goBack() {
    this.modalController.dismiss();
  }


  scrollEvent({ deltaY }) {
    if (deltaY) this.collapsedFab = 0 < deltaY;
  }


  toggleIcon() {
    this.isFav = !this.isFav;
  }


  toggleFav() {
    if (this.user.isFav !== this.isFav) {
      if (this.isFav) this.data.saveFavorite(this.user);
      else this.data.removeFavorite(this.user);
    }
  }


  requestService() {
    if (this.selectingProfessionals) this.user.selectedForRequest = !this.user.selectedForRequest
  }

}
