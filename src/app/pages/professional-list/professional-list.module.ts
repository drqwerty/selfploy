import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfessionalListPageRoutingModule } from './professional-list-routing.module';

import { ProfessionalListPage } from './professional-list.page';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { ServiceFilterModule } from 'src/app/components/modals/as-pages/service-filter/service-filter.module';
import { ProfessionalListTemplateModule } from 'src/app/components/templates/professional-list-template/professional-list-template.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalListPageRoutingModule,
    StatusBarModule,
    CustomHeaderModule,
    ProfessionalListTemplateModule,
    ServiceFilterModule,
  ],
  declarations: [
    ProfessionalListPage,
  ]
})
export class ProfessionalListPageModule {}
