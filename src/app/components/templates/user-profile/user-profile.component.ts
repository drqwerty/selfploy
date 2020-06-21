import { Component, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { User, UserRole } from 'src/app/models/user-model';


@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {

  @Input() backgroundColor: string;
  @Input() user: User;
  @Input() mapId: string;

  @Output() presentPopover = new EventEmitter<MouseEvent>();
  @Output() createProfessionalProfile = new EventEmitter<void>();
  @Output() activateProfessionalProfile = new EventEmitter<void>();


  @ViewChild(MapPreviewComponent) private mapPreview: MapPreviewComponent;

  userRol = UserRole;

  constructor() { }


  initMap() {
    this.mapPreview?.initMap();
  }

}
