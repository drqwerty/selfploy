import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import { ServiceSearchComponent } from './service-search.component';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { ProfessionalCardModule } from 'src/app/components/templates/professional-card/professional-card.module';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StatusBarModule,
    FormsModule,
    UpperCaseFirstLetterModule,
    ProfessionalCardModule,
  ],
  declarations: [
    ServiceSearchComponent,
  ],
  exports: [
    ServiceSearchComponent,
  ],
})
export class ServiceSearchModule { }
