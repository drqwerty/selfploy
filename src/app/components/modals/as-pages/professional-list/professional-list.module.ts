import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { ProfessionalListComponent } from './professional-list.component';
import { ProfessionalCardModule } from 'src/app/components/templates/professional-card/professional-card.module';
import { ProfessionalListTemplateModule } from 'src/app/components/templates/professional-list-template/professional-list-template.module';
import { ServiceFilterModule } from '../service-filter/service-filter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    CustomHeaderModule,
    ProfessionalCardModule,
    UpperCaseFirstLetterModule,
    ProfessionalListTemplateModule,
    ServiceFilterModule,
  ],
  declarations: [
    ProfessionalListComponent,
  ],
  exports: [
    ProfessionalListComponent
  ],
})
export class ProfessionalListModule { }
