import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeleteConfirmBottomSheetComponent } from './delete-confirm-bottom-sheet.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    DeleteConfirmBottomSheetComponent,
  ],
  exports: [
    DeleteConfirmBottomSheetComponent,
  ],
})
export class DeleteConfirmBottomSheetModule { }
