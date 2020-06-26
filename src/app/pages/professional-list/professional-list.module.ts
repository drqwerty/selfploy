import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfessionalListPageRoutingModule } from './professional-list-routing.module';

import { ProfessionalListPage } from './professional-list.page';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { ProfessionalCardModule } from 'src/app/components/templates/professional-card/professional-card.module';
import { CustomRangeModule } from 'src/app/components/utils/custom-range/custom-range.module';
import { ServiceFilterComponent } from 'src/app/components/modals/as-pages/service-filter/service-filter.component';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalListPageRoutingModule,
    StatusBarModule,
    CustomHeaderModule,
    ProfessionalCardModule,
    CustomRangeModule,
    EmptyContentModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [
    ProfessionalListPage,
    ServiceFilterComponent,
  ]
})
export class ProfessionalListPageModule {}
