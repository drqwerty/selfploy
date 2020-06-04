import { NgModule } from '@angular/core';
import { InputBottomSheetComponent } from './input-bottom-sheet.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
  ],
  declarations: [
    InputBottomSheetComponent,
  ],
  exports: [
    InputBottomSheetComponent,
  ],
})
export class InputBottomSheetModule { }
