import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MapRangeComponent } from './map-range.component';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import { CustomRangeModule } from 'src/app/components/utils/custom-range/custom-range.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StatusBarModule,
    FormsModule,
    CustomRangeModule,
  ],
  declarations: [
    MapRangeComponent,
  ],
  exports: [
    MapRangeComponent,
  ],
})
export class MapRangeModule { }
