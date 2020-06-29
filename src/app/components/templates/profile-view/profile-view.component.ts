import { Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { User, UserRole } from 'src/app/models/user-model';
import { IonContent } from '@ionic/angular';
import { auditTime, } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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

  @Output() scrollEvent = new EventEmitter<any>();


  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild('profileImageWrapper') private profileImageWrapper: ElementRef;

  profileImageIntersectionObserver: IntersectionObserver;
  bigProfileImageIsVisible = true;

  userRol = UserRole;
  showSpinner = true;

  constructor() { }

  ngAfterViewInit() {
    this.startScrollSubscription();
    this.setCornersStyle();
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
}
