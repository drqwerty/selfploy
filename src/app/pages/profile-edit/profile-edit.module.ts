import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileEditPageRoutingModule } from './profile-edit-routing.module';

import { ProfileEditPage } from './profile-edit.page';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import { InputBottomSheetModule } from 'src/app/components/input-bottom-sheet/input-bottom-sheet.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfileEditPageRoutingModule,
    StatusBarModule,
    InputBottomSheetModule,
  ],
  declarations: [ProfileEditPage],
})
export class ProfileEditPageModule {}
