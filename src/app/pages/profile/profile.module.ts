import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { ProfilePopoverComponent } from 'src/app/components/popovers/profile-popover/profile-popover.component';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { MapPreviewModule } from 'src/app/components/templates/map-preview/map-preview.module';
import { UserProfileModule } from 'src/app/components/templates/user-profile/user-profile.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    UserProfileModule,
  ],
  declarations: [
    ProfilePage,
    ProfilePopoverComponent,
  ]
})
export class ProfilePageModule {}
