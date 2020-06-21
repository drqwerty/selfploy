import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { UserProfileComponent } from './user-profile.component';
import { MapPreviewModule } from '../map-preview/map-preview.module';
import { StatusBarModule } from '../../utils/status-bar/status-bar.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    UpperCaseFirstLetterModule,
    MapPreviewModule,
  ],
  declarations: [
    UserProfileComponent,
  ],
  exports: [
    UserProfileComponent,
  ],
})
export class UserProfileModule { }
