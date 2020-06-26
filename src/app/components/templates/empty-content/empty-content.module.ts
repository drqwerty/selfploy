import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmptyContentComponent } from './empty-content.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    EmptyContentComponent
  ],
  exports: [
    EmptyContentComponent
  ],
})
export class EmptyContentModule { }
