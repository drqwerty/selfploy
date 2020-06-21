import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicesPageRoutingModule } from './services-routing.module';

import { ServicesPage } from './services.page';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicesPageRoutingModule,
    StatusBarModule,
    CustomHeaderModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [ServicesPage]
})
export class ServicesPageModule {}
