import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomHeaderComponent } from './custom-header.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [
    CustomHeaderComponent,
  ],
  exports: [
    CustomHeaderComponent,
  ],
})
export class CustomHeaderModule { }
