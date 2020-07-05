import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RequestListPageRoutingModule } from './request-list-routing.module';

import { RequestListPage } from './request-list.page';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';
import { RequestCardModule } from 'src/app/components/templates/request-card/request-card.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { RequestListPopoverComponent } from 'src/app/components/popovers/request-list-popover/request-list-popover.component';
import { RequestListOrderActionSheetComponent } from 'src/app/components/action-sheets/request-list-order-action-sheet/request-list-order-action-sheet.component';

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
    RequestCardModule,
  ],
  declarations: [
    RequestListPage,
    RequestListPopoverComponent,
    RequestListOrderActionSheetComponent,
  ]
})
export class RequestListPageModule {}
