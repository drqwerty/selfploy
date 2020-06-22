import { Component, ViewChild, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { User, UserRole } from 'src/app/models/user-model';
import { IonContent } from '@ionic/angular';
import { auditTime } from 'rxjs/operators';
import { Subscription, fromEvent } from 'rxjs';
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
  @ViewChild(MapPreviewComponent) private mapPreview: MapPreviewComponent;

  userRol = UserRole;
  showSpinner = true;

  constructor() { }

  ngAfterViewInit() {
    this.startScrollSubscription();
  }

  initMap() {
    this.mapPreview.initMap();
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

}
