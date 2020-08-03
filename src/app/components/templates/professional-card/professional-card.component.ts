import { Component, Input, OnInit, ViewChild, AfterViewInit, OnDestroy, AfterContentInit } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { ModalController } from '@ionic/angular';
import { ProfileModalComponent } from '../../modals/as-pages/profile/profile.component';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { DataService } from 'src/app/providers/data.service';
const { StatusBar } = Plugins;


@Component({
  selector: 'professional-card',
  templateUrl: './professional-card.component.html',
  styleUrls: ['./professional-card.component.scss'],
})
export class ProfessionalCardComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() user: User;
  @Input() selectingProfessionals = false;

  @ViewChild('card') card: any;

  isFav = true;

  reviewStats = { avg: 0, reviews: 0 };
  completedRequests = 0;

  showSpinner = true;
  cardIntersectionObserver: IntersectionObserver;

  constructor(
    private dataService: DataService,
    private modalController: ModalController
  ) { }


  ngOnInit() {
    this.getImage();
  }


  async ngAfterViewInit() {
    await this.getTotalNumberCompletedRequests();
    await this.getReviewStats();
    await this.checkFavState();
    if (this.user) this.startCardIntersectionObserver();
  }


  async getTotalNumberCompletedRequests() {
    this.completedRequests = await this.dataService.getTotalNumberCompletedRequestsBy(this.user.id);
  }


  async getReviewStats() {
    this.reviewStats = await this.dataService.getReviewStats(this.user.id);
  }


  ngOnDestroy() {
    if (this.user) this.cardIntersectionObserver.disconnect();
  }


  async checkFavState() {
    if (!this.user) return;
    this.isFav = !!(await this.dataService.getFavoriteList()).find(user => user.id === this.user.id);
  }


  async getImage() {
    if (this.user?.hasProfilePic) this.user.profilePic = await this.dataService.getUserProfilePic(this.user.id);
  }


  imageLoaded() {
    this.showSpinner = false;
  }


  toggleIcon() {
    this.isFav = !this.isFav;
  }


  toggleFav() {
    if (this.user && this.user.isFav !== this.isFav) {
      if (this.isFav) this.dataService.saveFavorite(this.user);
      else this.dataService.removeFavorite(this.user);
    }
  }

  requestService() {
    if (this.selectingProfessionals) this.user.selectedForRequest = !this.user.selectedForRequest;
  }


  async viewProfile(user: User) {
    const modal = await this.modalController.create({
      component: ProfileModalComponent,
      componentProps: { 
        backgroundColor: 'primary', user,
        selectingProfessionals: this.selectingProfessionals,
        completedRequests: this.completedRequests,
        reviewStats: this.reviewStats,
       }
    });

    modal.onWillDismiss().then(() => {
      if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
      this.checkFavState();
    });

    this.toggleFav();
    modal.onWillDismiss().then(() => modal.classList.remove('background-black'));
    modal.present().then(() => modal.classList.add('background-black'));
  }


  startCardIntersectionObserver() {
    this.cardIntersectionObserver = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting) {
        // Si se piden actualizaciones constantes se alcanza rapidamente el limite gratuito del plan spark de Firebase
        // await this.getTotalNumberCompletedRequests();
        // await this.getReviewStats();
        await this.checkFavState();
      }
    }, { threshold: 0 });
    this.cardIntersectionObserver.observe(this.card.el);
  }
}
