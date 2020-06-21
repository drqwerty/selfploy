import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { User, UserRole } from 'src/app/models/user-model';


@Component({
  selector: 'profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
})
export class ProfileViewComponent {

  @Input() backgroundColor: string;
  @Input() user: User;
  @Input() mapId: string;
  @Input() navBarSpace = false;


  @ViewChild(MapPreviewComponent) private mapPreview: MapPreviewComponent;

  userRol = UserRole;

  constructor() { }

  initMap() {
    this.mapPreview.initMap();
  }

}
