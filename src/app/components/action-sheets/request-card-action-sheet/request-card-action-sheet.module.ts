import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequestCardActionSheetComponent } from './request-card-action-sheet.component';
import { InfoModule } from '../../modals/info/info.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoModule,
  ],
  declarations: [
    RequestCardActionSheetComponent,
  ],
  exports: [
    RequestCardActionSheetComponent,
  ],
})
export class RequestCardActionSheetModule { }
