import { NgModule } from '@angular/core';
import { InputBottomSheetComponent } from './input-bottom-sheet.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutosizeModule } from 'ngx-autosize';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    AutosizeModule,
  ],
  declarations: [
    InputBottomSheetComponent,
  ],
  exports: [
    InputBottomSheetComponent,
  ],
})
export class InputBottomSheetModule { }
