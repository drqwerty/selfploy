import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { RequestCardComponent } from './request-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [
    RequestCardComponent,
  ],
  exports: [
    RequestCardComponent,
  ],
})
export class RequestCardModule { }
