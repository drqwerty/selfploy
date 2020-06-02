import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';

import { FivAppBarModule, FivFabModule, FivIconModule } from '@fivethree/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    FivAppBarModule,
    FivFabModule,
    FivIconModule,
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
