import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriesPageRoutingModule } from './categories-routing.module';

import { CategoriesPage } from './categories.page';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { CustomHeaderModule } from 'src/app/components/custom-header/custom-header.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CategoriesPageRoutingModule,
    StatusBarModule,
    UpperCaseFirstLetterModule,
    CustomHeaderModule,
  ],
  declarations: [
    CategoriesPage,
  ]
})
export class CategoriesPageModule { }
