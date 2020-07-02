import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabsPageRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';
import { FivAppBarModule, FivFabModule, FivIconModule } from '@fivethree/core';
import { RequestNewModule } from 'src/app/components/modals/as-pages/request-new/request-new.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    FivAppBarModule,
    FivFabModule,
    FivIconModule,
    RequestNewModule,
  ],
  declarations: [
    TabsPage,
  ]
})
export class TabsPageModule { }
