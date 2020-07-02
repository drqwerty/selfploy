import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeleteConfirmActionSheetComponent } from './delete-confirm-action-sheet.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    DeleteConfirmActionSheetComponent,
  ],
  exports: [
    DeleteConfirmActionSheetComponent,
  ],
})
export class DeleteConfirmActionSheetModule { }
