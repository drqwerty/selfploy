import { Component, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { CameraSource, CameraResultType, Plugins, CameraPhoto } from '@capacitor/core';
import { ImageCropperComponent } from '../image-cropper/image-cropper.component';

const { Camera } = Plugins;

@Component({
  selector: 'app-camera-source-action-sheet',
  templateUrl: './camera-source-action-sheet.component.html',
  styleUrls: ['./camera-source-action-sheet.component.scss']
})
export class CameraSourceActionSheetComponent {

  @Input() showRemoveButton: boolean;
  @Input() profilePic: any;
  @Input() imageWithoutCrop: string;

  modalRoot: HTMLIonModalElement;
  modalCropper: HTMLIonModalElement;
  loading: HTMLIonLoadingElement;



  constructor(
    private modalController: ModalController,
    private loadingController: LoadingController
  ) {
    modalController.getTop().then(modal => this.modalRoot = modal);
  }

  addImage() {
    this.cameraPlugin(CameraSource.Photos);
  }

  takePicture() {
    this.cameraPlugin(CameraSource.Camera);
  }

  async editImage() {
    this.modalRoot.classList.add('ion-invisible');
    await this.createCropperModal({ image: this.profilePic, });
    this.modalCropper.present();
  }

  removeImage() {
    this.modalRoot.dismiss({ remove: true });
  }

  async cameraPlugin(source: CameraSource) {
    this.loadingController.create().then(loading => this.loading = loading);
    this.modalRoot.classList.add('ion-invisible');
    this.modalRoot.animated = false;
    this.createCropperModal();

    try {
      const { base64String } = await Camera.getPhoto({
        quality: 50,
        source,
        resultType: CameraResultType.Base64,
      });
      this.profilePic = 'data:image/jpeg;base64,' + base64String
      this.modalCropper.componentProps = { image: this.profilePic, };
      this.loading.present();
      this.modalCropper.present();
    } catch {
      this.removeElements();
    }
  }

  removeElements() {
    this.modalRoot.dismiss();
    this.loading.remove();
    this.modalCropper.remove();
    console.log('catch');
  }

  async createCropperModal(componentProps?) {
    this.modalCropper = await this.modalController.create({
      component: ImageCropperComponent,
      animated: false,
      componentProps,
    });
    this.modalCropper.onWillDismiss().then(({ data }) => this.modalRoot.dismiss({ profilePicWithoutCrop: this.profilePic, ...data }));
  }

}
