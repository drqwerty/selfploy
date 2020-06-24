import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriesPageRoutingModule } from './categories-routing.module';

import { CategoriesPage } from './categories.page';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { ServiceSearchModule } from 'src/app/components/modals/as-pages/service-search/service-search.module';
import { ServiceFilterComponent } from 'src/app/components/modals/as-pages/service-filter/service-filter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriesPageRoutingModule,
    StatusBarModule,
    UpperCaseFirstLetterModule,
    CustomHeaderModule,
    ServiceSearchModule,
  ],
  declarations: [
    CategoriesPage,
    ServiceFilterComponent,
  ]
})
export class CategoriesPageModule { }
