import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { RequestNewComponent } from './request-new.component';
import { RequestWorkingHoursPickerComponent } from 'src/app/components/modals/request-working-hours-picker/request-working-hours-picker.component';
import { CalendarComponent } from 'src/app/components/modals/calendar/calendar.component';
import { CustomHeaderModule } from 'src/app/components/utils/custom-header/custom-header.module';
import { InputBottomSheetModule } from 'src/app/components/bottom-sheets/input-bottom-sheet/input-bottom-sheet.module';
import { AutosizeModule } from 'ngx-autosize';
import { MapLocationModule } from 'src/app/components/modals/as-pages/map-location/map-location.module';
import { CameraSourceActionSheetModule } from 'src/app/components/action-sheets/camera-source-action-sheet/camera-source-action-sheet.module';
import { GalleryModule } from 'src/app/components/fiv/gallery/gallery.module';
import { CalendarModule } from 'ion2-calendar';
import { RequestNewActionSheetComponent } from 'src/app/components/action-sheets/request-new-action-sheet/request-new-action-sheet.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StatusBarModule,
    FormsModule,
    UpperCaseFirstLetterModule,
    StatusBarModule,
    CustomHeaderModule,
    InputBottomSheetModule,
    AutosizeModule,
    MapLocationModule,
    CameraSourceActionSheetModule,
    GalleryModule,
    CalendarModule,
  ],
  declarations: [
    RequestNewComponent,
    RequestWorkingHoursPickerComponent,
    RequestNewActionSheetComponent,
    CalendarComponent,
  ],
  exports: [
    RequestNewComponent
  ],
})
export class RequestNewModule { }
