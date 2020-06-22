import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import { ModalController } from '@ionic/angular';
import { ProfileModalComponent } from '../../modals/as-pages/profile/profile.component';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;


@Component({
  selector: 'professional-card',
  templateUrl: './professional-card.component.html',
  styleUrls: ['./professional-card.component.scss'],
})
export class ProfessionalCardComponent implements OnInit {

  @Input() professional: User;


  stars = 3;
  jobs = 12;

  showSpinner = true;

  constructor(
    private fStorage: FirebaseStorage,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.getImage();
  }
  
  async getImage() {
    if (this.professional?.hasProfilePic) 
      this.professional.profilePic = await this.fStorage.getUserProfilePic(this.professional.id);
  }

  imageLoaded() {
    this.showSpinner = false;
  }

  async viewProfile(user: User) {
    const modal = await this.modalController.create({
      component: ProfileModalComponent,
      componentProps: { backgroundColor: 'primary', user }
    });

    modal.onWillDismiss().then(() => {
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
    });

    modal.present();
  }
}
