import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import { ProfilePopoverComponent } from 'src/app/components/profile-popover/profile-popover.component';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { MapPreviewModule } from 'src/app/components/map-preview/map-preview.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    StatusBarModule,
    MapPreviewModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [
    ProfilePage,
    ProfilePopoverComponent,
  ]
})
export class ProfilePageModule {}
