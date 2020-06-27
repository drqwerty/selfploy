import { Component, Input, OnInit, EventEmitter, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import { ModalController, IonCard } from '@ionic/angular';
import { ProfileModalComponent } from '../../modals/as-pages/profile/profile.component';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { StorageService } from 'src/app/services/storage.service';
const { StatusBar } = Plugins;


@Component({
  selector: 'professional-card',
  templateUrl: './professional-card.component.html',
  styleUrls: ['./professional-card.component.scss'],
})
export class ProfessionalCardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() user: User;

  @Output() profileViewClosed = new EventEmitter<void>()


  @ViewChild('card') card: any;

  isFav = false;

  stars = 3;
  jobs = 12;

  showSpinner = true;
  cardIntersectionObserver: IntersectionObserver;

  constructor(
    private storage: StorageService,
    private fStorage: FirebaseStorage,
    private modalController: ModalController
  ) {
  }

  ngOnInit() {
    this.checkFavState();
    this.getImage();
  }

  ngAfterViewInit() {
    if (this.user) this.startCardIntersectionObserver();
  }

  ngOnDestroy() {
    if (this.user) this.cardIntersectionObserver.disconnect();
  }

  async checkFavState() {
    if (!this.user) return;
    this.isFav = (await this.storage.getFavorites()).find(user => user.id === this.user.id)?.isFav ?? false;
  }

  async getImage() {
    if (this.user?.hasProfilePic) this.user.profilePic = await this.fStorage.getUserProfilePic(this.user.id);
  }

  imageLoaded() {
    this.showSpinner = false;
  }

  toggleIcon() {
    this.isFav = !this.isFav;
  }

  toggleFav() {
    if (this.user && this.user.isFav !== this.isFav) {
      if (this.isFav) this.storage.saveFavorite(this.user);
      else this.storage.removeFavorite(this.user);
    }
  }

  async viewProfile(user: User) {
    const modal = await this.modalController.create({
      component: ProfileModalComponent,
      componentProps: { backgroundColor: 'primary', user }
    });

    modal.onWillDismiss().then(() => {
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
      this.profileViewClosed.emit();
      this.checkFavState();
    });

    modal.present();
  }

  startCardIntersectionObserver() {
    this.cardIntersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) this.checkFavState();
    }, { threshold: 0 });
    this.cardIntersectionObserver.observe(this.card.el);
  }
}
