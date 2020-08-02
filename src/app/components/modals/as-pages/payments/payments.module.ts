import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentsComponent } from './payments.component';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';
import { NewReviewComponent } from '../new-review/new-review.component';
import { StarRatingModule } from 'ionic5-star-rating';
import { AutosizeModule } from 'ngx-autosize';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    StatusBarModule,
    EmptyContentModule,
    StarRatingModule,
    AutosizeModule,
  ],
  declarations: [
    PaymentsComponent,
    NewReviewComponent,
  ],
  exports: [
    PaymentsComponent
  ],
})
export class PaymentsModule { }
