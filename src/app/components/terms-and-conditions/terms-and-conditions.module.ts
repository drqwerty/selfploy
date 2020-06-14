import { NgModule } from '@angular/core';
import { TermsAndConditionsComponent } from './terms-and-conditions.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
  ],
  declarations: [
    TermsAndConditionsComponent,
  ],
  exports: [
    TermsAndConditionsComponent,
  ],
})
export class TermsAndConditionsModule { }
