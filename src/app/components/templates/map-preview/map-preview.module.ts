import { NgModule } from '@angular/core';
import { MapPreviewComponent } from './map-preview.component';
import { MapFullScreenModule } from '../../modals/as-pages/map-full-screen/map-full-screen.module';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    MapFullScreenModule,
  ],
  declarations: [
    MapPreviewComponent,
  ],
  exports: [
    MapPreviewComponent,
  ],
})
export class MapPreviewModule { }
