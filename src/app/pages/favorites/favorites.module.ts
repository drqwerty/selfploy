import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FavoritesPageRoutingModule } from './favorites-routing.module';

import { FavoritesPage } from './favorites.page';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';
import { ProfessionalCardModule } from 'src/app/components/templates/professional-card/professional-card.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FavoritesPageRoutingModule,
    StatusBarModule,
    CustomHeaderModule,
    EmptyContentModule,
    ProfessionalCardModule,
    SuperTabsModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [FavoritesPage]
})
export class FavoritesPageModule { }
