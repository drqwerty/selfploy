import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TabsPageRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';
import { FivAppBarModule, FivFabModule, FivIconModule } from '@fivethree/core';
import { RequestNewComponent } from 'src/app/components/modals/as-pages/request-new/request-new.component';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { InputBottomSheetModule } from 'src/app/components/bottom-sheets/input-bottom-sheet/input-bottom-sheet.module';
import { AutosizeModule } from 'ngx-autosize';
import { MapLocationModule } from 'src/app/components/modals/as-pages/map-location/map-location.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    FivAppBarModule,
    FivFabModule,
    FivIconModule,
    StatusBarModule,
    CustomHeaderModule,
    UpperCaseFirstLetterModule,
    InputBottomSheetModule,
    AutosizeModule,
    MapLocationModule,
  ],
  declarations: [
    TabsPage,
    RequestNewComponent,
  ]
})
export class TabsPageModule { }
