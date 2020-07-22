import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController, IonContent, LoadingController } from '@ionic/angular';
import { Request, RequestProperties, RequestStatus } from 'src/app/models/request-model';
import { MapLocationComponent } from 'src/app/components/modals/as-pages/map-location/map-location.component';
import { ModalAnimationSlideWithOpacityFromModalEnter, ModalAnimationSlideWithOpacityFromModalLeave } from 'src/app/animations/page-transitions';
import { Validators, FormControl, FormBuilder } from '@angular/forms';
import { InputBottomSheetComponent } from 'src/app/components/bottom-sheets/input-bottom-sheet/input-bottom-sheet.component';
import { ServicePickerComponent } from 'src/app/components/modals/as-pages/service-picker/service-picker.component';
import { CameraSourceActionSheetComponent } from 'src/app/components/action-sheets/camera-source-action-sheet/camera-source-action-sheet.component';
import { GalleryComponent } from 'src/app/components/fiv/gallery/gallery.component';
import { RequestWorkingHoursPickerComponent } from 'src/app/components/modals/request-working-hours-picker/request-working-hours-picker.component';
import { CalendarComponent } from 'src/app/components/modals/calendar/calendar.component';
import * as moment from 'moment';
import { RequestNewActionSheetComponent } from 'src/app/components/action-sheets/request-new-action-sheet/request-new-action-sheet.component';
import { DataService } from 'src/app/providers/data.service';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';

@Component({
  selector: 'app-request-new',
  templateUrl: './request-new.component.html',
  styleUrls: ['./request-new.component.scss'],
})
export class RequestNewComponent implements OnInit {

  @Input() edit = false;
  @Input() request = new Request();


  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(GalleryComponent) gallery: GalleryComponent;

  tempRequest: Request;
  chooseDayDefaultText = 'Elige una fecha';

  constructor(
    private modalController: ModalController,
    private anim: Animations,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private data: DataService,
  ) { }


  ngOnInit() {
    this.tempRequest = new Request(this.request);
    this.tempRequest.title = 'titulazo';
    this.tempRequest.description = 'descripcionaca';
    this.tempRequest.category = 'carpintería';
    this.tempRequest.service = 'aluminio';
  }


  ionViewWillEnter() {
    // this.anim.modalLoaded();
    // this.continue();
  }


  async goBack() {
    // await this.anim.startReverseAnimation();
    this.modalController.dismiss();
  }


  async continue() {
    const modal = await this.modalController.create({
      cssClass: 'action-sheet border-top-radius',
      component: RequestNewActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      componentProps: {
        requestIsComplete: this.requestIsComplete(),
      }
    });

    modal.onDidDismiss().then(({ data }) => {
      switch (data) {
        case 'save':
          this.saveRequest(RequestStatus.draft, true);
          break;

        case 'choose':
          this.saveRequest(RequestStatus.open);
          console.log('c', data);
          break;

        case 'notifyAll':
          this.notifyAll();
          console.log('n', data);
          break;
      }
    })

    modal.present();
  }


  async saveRequest(status: RequestStatus, onlySave = false) {
    this.tempRequest.status = status;
    Request.copy(this.tempRequest, this.request);
    const loading = await this.loadingController.create();

    const promises = await Promise.all([
      this.data.saveRequest(this.request),
      loading.present(),
    ]);
    const requestData = promises[0];
    this.request = requestData.requestSaved;

    if (onlySave)
      this.loadingController.dismiss().then(() => this.modalController.dismiss());

    return requestData;
  }


  async notifyAll() {
    const requestData = await this.saveRequest(RequestStatus.open);
    await this.data.sendRequestNotifications(requestData);
    this.loadingController.dismiss().then(() => this.modalController.dismiss());
  }


  requestIsComplete() {
    const validations = {
      service: this.tempRequest?.service?.length > 0,
      category: this.tempRequest?.category?.length > 0,
      now: !!((this.tempRequest.priority && this.tempRequest.startDate)),
      date1: !!(!this.tempRequest.priority && this.tempRequest.startDate && !this.tempRequest.endDate),
      date2: !!(!this.tempRequest.priority && this.tempRequest.startDate && this.tempRequest.endDate),
      hours: this.tempRequest?.workingHours?.length > 0,
      title: this.tempRequest?.title?.length > 0,
      description: this.tempRequest?.description?.length > 0,
      imgs: this.tempRequest.hasImages,
      budget: this.tempRequest?.budget >= 0,
      location: this.tempRequest?.coordinates != null
    };

    const isComplete =
      validations.service
      && validations.category
      && (validations.now || (validations.date1 || validations.date2) && validations.hours)
      && validations.title
      && validations.description
      && validations.location;

    // console.log({ isComplete });
    // console.table(validations);

    return isComplete;
  }


  updateHasImageProperty() {
    this.tempRequest.hasImages = this.tempRequest.images.length > 0;
  }


  async editService() {
    const modal = await this.modalController.create({
      component: ServicePickerComponent,
      enterAnimation: ModalAnimationSlideWithOpacityFromModalEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityFromModalLeave,
      componentProps: {
        title: 'Busco...',
        userServices: { [this.tempRequest.category]: [this.tempRequest.service] },
        limit: 1,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        delete this.tempRequest.category;
        delete this.tempRequest.service;
        if (Object.keys(data).length) {
          setTimeout(() => {
            this.tempRequest.category = Object.keys(data)[0];
            this.tempRequest.service = Object.values(data)[0][0];
          });
        }
      }
    })

    modal.present();
  }


  async setNow() {
    // this.chooseWorkingHours(true);
    delete this.tempRequest.endDate;
    delete this.tempRequest.workingHours;
    this.tempRequest.startDate = moment();
    this.tempRequest.priority = true;
  }


  async chooseDay() {
    console.log(this.tempRequest);

    let componentProps;
    if (!this.tempRequest.priority)
      componentProps = { dateRange: { from: this.tempRequest.startDate, to: this.tempRequest.endDate } }

    const modal = await this.modalController.create({
      cssClass: 'calendar-modal',
      component: CalendarComponent,
      componentProps,
    });

    modal.onDidDismiss().then(async ({ data }) => {
      if (data?.from) {
        let dateString = data.from.format('L');
        if (!(data.from).isSame(data.to)) dateString += ' - ' + data.to.format('L');
        try {
          const selectedWorkingHours = await this.chooseWorkingHours(false, dateString);
          this.tempRequest.priority = false;
          delete this.tempRequest.startDate;
          delete this.tempRequest.endDate;
          if (selectedWorkingHours) {
            this.tempRequest.startDate = data.from;
            if (!(data.from).isSame(data.to)) this.tempRequest.endDate = data.to;
          }
        } catch { }
      }
    })

    modal.present();
  }


  chooseWorkingHours(priority: boolean, dateString = moment().format('L')): Promise<boolean> {
    return new Promise(async (resolve, reject) => {

      const modal = await this.modalController.create({
        component: RequestWorkingHoursPickerComponent,
        cssClass: 'modal',
        componentProps: {
          dateString,
          requestWorkingHours: this.tempRequest.workingHours ?? []
        }
      });

      modal.onWillDismiss().then(({ data }) => {
        if (data) {
          this.tempRequest.workingHours = data;
          if (data.length) this.tempRequest.priority = priority;
          else delete this.tempRequest.workingHours;
          resolve(data.length);
        } else {
          reject();
        }
      });

      modal.present();
    });
  }


  async addImage() {
    if (this.tempRequest.images.length > 5) return;

    const modal = await this.modalController.create({
      component: CameraSourceActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet',
      componentProps: {
        showRemoveButton: false,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data?.image) {
        this.tempRequest.images.push({ name: moment().unix().toString(), url: data.image });
        this.updateHasImageProperty();
        this.gallery.updateImages();
      }
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
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        type,
        title,
        form: this.formBuilder.group({
          value: new FormControl(this.tempRequest[userProperty], validators),
        }),
        keyboardType,
      },
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.tempRequest[userProperty] = data.value;
      if (this.tempRequest[userProperty] === '') delete this.tempRequest[userProperty];
    });

    modal.present();
  }


  async editLocation() {
    const modal = await this.modalController.create({
      component: MapLocationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityFromModalEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityFromModalLeave,
      componentProps: {
        hideLocationAccuracy: this.tempRequest.hideLocationAccuracy,
        addressFull: this.tempRequest.addressFull,
        addressCity: this.tempRequest.addressCity,
        coordinates: this.tempRequest.coordinates,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        this.tempRequest.hideLocationAccuracy = data.hideLocationAccuracy;
        this.tempRequest.addressFull = data.addressFull;
        this.tempRequest.addressCity = data.addressCity;
        this.tempRequest.coordinates = data.coordinates;
        this.ionContent.scrollToBottom();
      }
    });

    modal.present();
  }

}
