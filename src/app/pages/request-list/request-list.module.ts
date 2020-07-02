import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestListPageRoutingModule } from './request-list-routing.module';

import { RequestListPage } from './request-list.page';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';
import { RequestCardComponent } from 'src/app/components/templates/request-card/request-card.component';
import { SuperTabsModule } from '@ionic-super-tabs/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RequestListPageRoutingModule,
    StatusBarModule,
    CustomHeaderModule,
    EmptyContentModule,
    SuperTabsModule,
  ],
  declarations: [
    RequestListPage,
    RequestCardComponent,
  ]
})
export class RequestListPageModule {}
