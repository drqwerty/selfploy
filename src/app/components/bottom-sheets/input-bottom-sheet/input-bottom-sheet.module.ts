import { NgModule } from '@angular/core';
import { InputBottomSheetComponent } from './input-bottom-sheet.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutosizeModule } from 'ngx-autosize';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
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
