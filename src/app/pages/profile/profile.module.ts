import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { ProfilePopoverComponent } from 'src/app/components/popovers/profile-popover/profile-popover.component';
import { ProfileViewModule } from 'src/app/components/templates/profile-view/profile-view.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ProfileViewModule,
  ],
  declarations: [
    ProfilePage,
    ProfilePopoverComponent,
  ]
})
export class ProfilePageModule {}
