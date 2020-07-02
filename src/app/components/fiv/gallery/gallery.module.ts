import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from './gallery.component';
import { FivGalleryModule, FivGalleryImage } from '@fivethree/core';
import { FormsModule } from '@angular/forms';
import { DeleteConfirmActionSheetModule } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FivGalleryModule,
    DeleteConfirmActionSheetModule,
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
