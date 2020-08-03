import { Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { User, UserRole } from 'src/app/models/user-model';
import { IonContent, ModalController } from '@ionic/angular';
import { auditTime, } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DataService } from 'src/app/providers/data.service';
import { ReviewsComponent } from '../../modals/as-pages/reviews/reviews.component';
import { ModalAnimationSlideWithOpacityFromModalEnter, ModalAnimationSlideWithOpacityFromModalLeave, ModalAnimationSlideEnter, ModalAnimationSlideLeave, ModalAnimationSlideWithOpacityEnter, ModalAnimationSlideWithOpacityLeave } from 'src/app/animations/page-transitions';

@UntilDestroy()
@Component({
  selector: 'profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
})
export class ProfileViewComponent implements AfterViewInit {

  @Input() backgroundColor: string;
  @Input() user: User;
  @Input() mapId: string;
  @Input() navBarSpace = false;
  @Input() scrollEvents = false;
  @Input() completedRequests = 0;
  @Input() reviewStats = { avg: 0, reviews: 0 };
  @Input() isAPage = false;


  @Output() scrollEvent = new EventEmitter<any>();


  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(MapPreviewComponent) private mapPreview: MapPreviewComponent;
  @ViewChild('profileImageWrapper') private profileImageWrapper: ElementRef;

  profileImageIntersectionObserver: IntersectionObserver;
  bigProfileImageIsVisible = true;

  userRol = UserRole;
  showSpinner = true;


  constructor(
    private dataService: DataService,
    private modalController: ModalController,
  ) { }


  ngAfterViewInit() {
    if (this.user?.role === this.userRol.professional) {
      this.getTotalNumberCompletedRequests();
      this.getReviewStats();
    }
    this.startScrollSubscription();
    this.setCornersStyle();
  }


  initMap() {
    if (this.user.role === this.userRol.professional) this.mapPreview.initMap();
  }


  async getTotalNumberCompletedRequests() {
    this.completedRequests = await this.dataService.getTotalNumberCompletedRequestsBy(this.user.id);
  }


  async getReviewStats() {
    if (!this.reviewStats) this.reviewStats = await this.dataService.getReviewStats(this.user.id);
  }


  imageLoaded() {
    this.showSpinner = false;
  }


  startScrollSubscription() {
    if (this.scrollEvents)
      this.ionContent.ionScroll
        .pipe(
          untilDestroyed(this),
          auditTime(250)
        )
        .subscribe(({ detail }) => this.scrollEvent.emit(detail));
  }


  setCornersStyle() {
    setTimeout(() => {
      const shadowRoot = (this.ionContent as any).el.shadowRoot;
      const background = shadowRoot.querySelector("#background-content") as HTMLElement;
      const content = shadowRoot.querySelector(".inner-scroll") as HTMLElement;
      
      background.style.backgroundColor = `var(--ion-color-${this.backgroundColor})`;
      content.style.borderRadius = '40px 40px 0 0';
    });
  }


  startProfileImageIntersectionObserver() {
    this.profileImageIntersectionObserver = new IntersectionObserver(entries =>
      this.bigProfileImageIsVisible = entries[0].isIntersecting,
      { threshold: 0 });
    this.profileImageIntersectionObserver.observe(this.profileImageWrapper.nativeElement);
  }


  stopProfileImageIntersectionObserver() {
    this.profileImageIntersectionObserver.disconnect();
  }


  async presentReviewsModal() {
    const modal = await this.modalController.create({
      enterAnimation: this.isAPage ? ModalAnimationSlideWithOpacityEnter : ModalAnimationSlideWithOpacityFromModalEnter,
      leaveAnimation: this.isAPage ? ModalAnimationSlideWithOpacityLeave : ModalAnimationSlideWithOpacityFromModalLeave,
      component: ReviewsComponent,
      componentProps: { userId: this.user.id }
    });
  
    await modal.present();
  }
}
