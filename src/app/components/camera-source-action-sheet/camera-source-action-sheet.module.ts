import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { CameraSourceActionSheetComponent } from './camera-source-action-sheet.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageCropperModule,
  ],
  declarations: [
    CameraSourceActionSheetComponent,
    ImageCropperComponent,
  ],
  exports: [
    CameraSourceActionSheetComponent,
  ],
})
export class CameraSourceActionSheetModule { }
