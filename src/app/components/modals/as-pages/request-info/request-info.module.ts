import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { RequestInfoComponent } from './request-info.component';
import { MapPreviewModule } from 'src/app/components/templates/map-preview/map-preview.module';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { AutosizeModule } from 'ngx-autosize';
import { GalleryModule } from 'src/app/components/fiv/gallery/gallery.module';
import { SuperTabsModule } from '@ionic-super-tabs/angular';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';
import { FabWithTextModule } from 'src/app/components/templates/fab-with-text/fab-with-text.module';
import { RequestCardActionSheetModule } from 'src/app/components/action-sheets/request-card-action-sheet/request-card-action-sheet.module';
import { RequestNewModule } from '../request-new/request-new.module';
import { DeleteConfirmActionSheetModule } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    CustomHeaderModule,
    MapPreviewModule,
    UpperCaseFirstLetterModule,
    AutosizeModule,
    GalleryModule,
    SuperTabsModule,
    EmptyContentModule,
    FabWithTextModule,
    RequestCardActionSheetModule,
    RequestNewModule,DeleteConfirmActionSheetModule
  ],
  declarations: [
    RequestInfoComponent
  ],
  exports: [
    RequestInfoComponent
  ]
})
export class RequestInfoModule { }
