import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { ServiceFilterComponent } from './service-filter.component';
import { CustomRangeModule } from 'src/app/components/utils/custom-range/custom-range.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    CustomHeaderModule,
    CustomRangeModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [
    ServiceFilterComponent,
  ],
  exports: [
    ServiceFilterComponent,
  ],
})
export class ServiceFilterModule { }
