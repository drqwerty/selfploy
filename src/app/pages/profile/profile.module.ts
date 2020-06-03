import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import { ProfilePopoverComponent } from 'src/app/components/profile-popover/profile-popover.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    StatusBarModule,
  ],
  declarations: [
    ProfilePage,
    ProfilePopoverComponent,
  ]
})
export class ProfilePageModule {}
