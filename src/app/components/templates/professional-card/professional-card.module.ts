import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalCardComponent } from './professional-card.component';
import { ProfileModalModule } from 'src/app/components/modals/as-pages/profile/profile.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import DebounceClickModule from 'src/app/directives/debounce-click.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpperCaseFirstLetterModule,
    ProfileModalModule,
    DebounceClickModule,
  ],
  declarations: [
    ProfessionalCardComponent,
  ],
  exports: [
    ProfessionalCardComponent,
  ],
})
export class ProfessionalCardModule { }
