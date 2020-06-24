import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomRangeComponent } from './custom-range.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    CustomRangeComponent,
  ],
  exports: [
    CustomRangeComponent,
  ],
})
export class CustomRangeModule { }
