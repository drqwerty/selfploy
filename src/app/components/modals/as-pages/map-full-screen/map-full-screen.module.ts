import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { StatusBarModule } from 'src/app/components/utils/status-bar/status-bar.module';
import { FormsModule } from '@angular/forms';
import { MapFullScreenComponent } from './map-full-screen.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    StatusBarModule,
    FormsModule,
  ],
  declarations: [
    MapFullScreenComponent,
  ],
  exports: [
    MapFullScreenComponent,
  ],
})
export class MapFullScreenModule { }
