import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MapLocationComponent } from './map-location.component';
import { StatusBarModule } from 'src/app/components/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import { MapSearchComponent } from '../map-search/map-search.component';



@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StatusBarModule,
    FormsModule,
  ],
  declarations: [
    MapLocationComponent,
    MapSearchComponent,
  ],
  exports: [
    MapLocationComponent,
  ],
})
export class MapLocationModule { }
