import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';
import { RequestCardComponent } from './request-card.component';
import { RequestCardActionSheetModule } from '../../action-sheets/request-card-action-sheet/request-card-action-sheet.module';
import { DeleteConfirmActionSheetModule } from '../../action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpperCaseFirstLetterModule,
    RequestCardActionSheetModule,
    DeleteConfirmActionSheetModule,
  ],
  declarations: [
    RequestCardComponent,
  ],
  exports: [
    RequestCardComponent,
  ],
})
export class RequestCardModule { }
