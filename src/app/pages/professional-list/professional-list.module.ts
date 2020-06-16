import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfessionalListPageRoutingModule } from './professional-list-routing.module';

import { ProfessionalListPage } from './professional-list.page';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import { CustomHeaderModule } from 'src/app/components/custom-header/custom-header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalListPageRoutingModule,
    StatusBarModule,
    CustomHeaderModule,
  ],
  declarations: [ProfessionalListPage]
})
export class ProfessionalListPageModule {}
