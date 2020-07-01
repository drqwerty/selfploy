import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from './gallery.component';
import { FivGalleryModule, FivGalleryImage } from '@fivethree/core';
import { FormsModule } from '@angular/forms';
import { DeleteConfirmBottomSheetModule } from '../../bottom-sheets/delete-confirm-bottom-sheet/delete-confirm-bottom-sheet.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FivGalleryModule,
    DeleteConfirmBottomSheetModule,
  ],
  declarations: [
    GalleryComponent,
  ],
  exports: [
    GalleryComponent,
    FivGalleryImage,
  ],
})
export class GalleryModule { }
