import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CustomHeaderComponent } from './custom-header.component';
import UpperCaseFirstLetterModule from 'src/app/directives/uppercase-first-letter.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UpperCaseFirstLetterModule,
  ],
  declarations: [
    CustomHeaderComponent,
  ],
  exports: [
    CustomHeaderComponent,
  ],
})
export class CustomHeaderModule { }
