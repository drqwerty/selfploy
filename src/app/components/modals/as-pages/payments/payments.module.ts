import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentsComponent } from './payments.component';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { EmptyContentModule } from 'src/app/components/templates/empty-content/empty-content.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StatusBarModule,
    EmptyContentModule,
  ],
  declarations: [
    PaymentsComponent
  ],
  exports: [
    PaymentsComponent
  ],
})
export class PaymentsModule { }
