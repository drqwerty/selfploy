import { NgModule } from '@angular/core';
import { MapPreviewComponent } from './map-preview.component';
import { MapFullScreenModule } from '../../modals/as-pages/map-full-screen/map-full-screen.module';

@NgModule({
  imports: [
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
