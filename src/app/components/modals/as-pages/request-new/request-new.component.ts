import { Component, OnInit } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController } from '@ionic/angular';
import { Request, RequestProperties } from 'src/app/models/request-model';
import { MapLocationComponent } from '../map-location/map-location.component';
import { ModalAnimationSlideWithOpacityEnter, ModalAnimationSlideWithOpacityLeave, ModalAnimationSlideWithOpacityEnterFromModal, ModalAnimationSlideWithOpacityLeaveFromModal } from 'src/app/animations/page-transitions';
import { Validators, FormControl, FormBuilder } from '@angular/forms';
import { InputBottomSheetComponent } from 'src/app/components/bottom-sheets/input-bottom-sheet/input-bottom-sheet.component';
import { ServicePickerComponent } from '../service-picker/service-picker.component';

@Component({
  selector: 'app-request-new',
  templateUrl: './request-new.component.html',
  styleUrls: ['./request-new.component.scss'],
})
export class RequestNewComponent implements OnInit {

  request: Request;

  constructor(
    private modalController: ModalController,
    private anim: Animations,
    private formBuilder: FormBuilder,
  ) {
    this.request = new Request();
  }

  ngOnInit() { }

  ionViewWillEnter() {
    // this.anim.modalLoaded();
  }

  async goBack() {
    // await this.anim.startReverseAnimation();
    this.modalController.dismiss();
  }

  async editService() {
    const modal = await this.modalController.create({
      component: ServicePickerComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnterFromModal,
      leaveAnimation: ModalAnimationSlideWithOpacityLeaveFromModal,
      componentProps: {
        title: 'Busco...',
        userServices: this.request.service,
        limit: 1,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.request.service = data;
    });

    modal.present();
  }

  editTitle() {
    this.presentInputBottomSheet('Título', RequestProperties.title);
  }

  editDescription() {
    this.presentInputBottomSheet('Descripción', RequestProperties.description, false, 'text-area');
  }

  editBudget() {
    this.presentInputBottomSheet('Presupuesto', RequestProperties.budget, true, 'input', 'number');
  }

  async presentInputBottomSheet(title, userProperty, optional = false, type: 'input' | 'text-area' = 'input', keyboardType: 'text' | 'number' = 'text') {

    const validators = optional ? [] : [Validators.required, Validators.minLength(3)];

    const modal = await this.modalController.create({
      component: InputBottomSheetComponent,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        type,
        title,
        form: this.formBuilder.group({
          value: new FormControl(this.request[userProperty], validators),
        }),
        keyboardType,
      },
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.request[userProperty] = data.value;
      if (this.request[userProperty] === '') delete this.request[userProperty];
      console.log(this.request);

    });

    modal.present();
  }

  async editLocation() {
    const modal = await this.modalController.create({
      component: MapLocationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnterFromModal,
      leaveAnimation: ModalAnimationSlideWithOpacityLeaveFromModal,
      componentProps: {
        hideLocationAccuracy: this.request.hideLocationAccuracy,
        addressFull: this.request.addressFull,
        addressCity: this.request.addressCity,
        coordinates: this.request.coordinates,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        this.request.hideLocationAccuracy = data.hideLocationAccuracy;
        this.request.addressFull = data.addressFull;
        this.request.addressCity = data.addressCity;
        this.request.coordinates = data.coordinates;
      }
    });

    modal.present();
  }

}
