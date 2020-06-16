import { Component, Input, ViewChild } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent as _ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss'],
})
export class ImageCropperComponent {

  @ViewChild(_ImageCropperComponent) imageCropper: _ImageCropperComponent;

  @Input() image: string;
  croppedImage = '';


  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController,
  ) { }

  ionViewDidEnter() {
  }

  cropperReady() {
    this.loadingController.dismiss();
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  cancel() {
    this.modalController.dismiss();
  }

  accept() {
    this.imageCropper.crop()
    this.modalController.dismiss(this.croppedImage);
  }
}