import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfessionalListComponent } from './professional-list.component';
import { ProfessionalCardModule } from '../professional-card/professional-card.module';
import { EmptyContentModule } from '../empty-content/empty-content.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfessionalCardModule,
    EmptyContentModule,
  ],
  declarations: [
    ProfessionalListComponent,
  ],
  exports: [
    ProfessionalListComponent,
  ],
})
export class ProfessionalListModule { }
