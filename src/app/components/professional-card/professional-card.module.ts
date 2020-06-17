import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalCardComponent } from './professional-card.component';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [
    ProfessionalCardComponent,
  ],
  exports: [
    ProfessionalCardComponent,
  ],
})
export class ProfessionalCardModule { }
