import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MapRangeComponent } from './map-range.component';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StatusBarModule,
    FormsModule,
  ],
  declarations: [
    MapRangeComponent,
  ],
  exports: [
    MapRangeComponent,
  ],
})
export class MapRangeModule { }
