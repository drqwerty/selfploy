import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { ProfileViewComponent } from './profile-view.component';
import { MapPreviewModule } from '../map-preview/map-preview.module';
import { StatusBarModule } from '../../utils/status-bar/status-bar.module';
import { ReviewsComponent } from '../../modals/as-pages/reviews/reviews.component';
import { CustomHeaderModule } from '../../utils/custom-header/custom-header.module';
import { EmptyContentModule } from '../empty-content/empty-content.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    UpperCaseFirstLetterModule,
    MapPreviewModule,
    CustomHeaderModule,
    EmptyContentModule,
  ],
  declarations: [
    ProfileViewComponent,
    ReviewsComponent,
  ],
  exports: [
    ProfileViewComponent,
  ],
})
export class ProfileViewModule { }
