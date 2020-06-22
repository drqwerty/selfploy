import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FabWithTextComponent } from './fab-with-text.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    FabWithTextComponent
  ],
  exports: [
    FabWithTextComponent
  ],
})
export class FabWithTextModule { }
