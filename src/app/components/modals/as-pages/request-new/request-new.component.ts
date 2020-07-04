import { Component, ViewChild, Input } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController, IonContent, LoadingController } from '@ionic/angular';
import { Request, RequestProperties, RequestStatus } from 'src/app/models/request-model';
import { MapLocationComponent } from 'src/app/components/modals/as-pages/map-location/map-location.component';
import { ModalAnimationSlideWithOpacityEnterFromModal, ModalAnimationSlideWithOpacityLeaveFromModal } from 'src/app/animations/page-transitions';
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
export class RequestNewComponent {

  @Input() edit = false;
  @Input() request: Request = new Request();


  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(GalleryComponent) gallery: GalleryComponent;

  chooseDayDefaultText = 'Elige una fecha';

  constructor(
    private modalController: ModalController,
    private anim: Animations,
    private formBuilder: FormBuilder,
    private loadingController: LoadingController,
    private data: DataService,
  ) { }

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
          this.saveRequest(RequestStatus.draft);
          break;

        case 'choose':
          this.saveRequest(RequestStatus.open);
          console.log('c', data);
          break;

        case 'notifyAll':
          this.saveRequest(RequestStatus.open);
          console.log('n', data);
          break;
      }
    })

    modal.present();
  }

  async saveRequest(status: RequestStatus) {
    this.request.status = status;
    const loading = await this.loadingController.create();

    await Promise.all([
      loading.present(),
      this.data.saveRequest(this.request),
    ]);

    loading.dismiss().then(() => this.modalController.dismiss());
  }

  requestIsComplete() {
    const validations = {
      service: this.request?.service?.length > 0,
      category: this.request?.category?.length > 0,
      now: !!((this.request.priority && this.request.startDate)),
      date1: !!(!this.request.priority && this.request.startDate && !this.request.endDate),
      date2: !!(!this.request.priority && this.request.startDate && this.request.endDate),
      hours: this.request?.workingHours?.length > 0,
      title: this.request?.title?.length > 0,
      description: this.request?.description?.length > 0,
      imgs: this.request.hasImages,
      budget: this.request?.budget >= 0,
      location: this.request?.coordinates != null
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
    this.request.hasImages = this.request.images.length > 0;
  }

  async editService() {
    const modal = await this.modalController.create({
      component: ServicePickerComponent,
      enterAnimation: ModalAnimationSlideWithOpacityEnterFromModal,
      leaveAnimation: ModalAnimationSlideWithOpacityLeaveFromModal,
      componentProps: {
        title: 'Busco...',
        userServices: { [this.request.category]: [this.request.service] },
        limit: 1,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        delete this.request.category;
        delete this.request.service;
        if (Object.keys(data).length) {
          setTimeout(() => {
            this.request.category = Object.keys(data)[0];
            this.request.service = Object.values(data)[0][0];
          });
        }
      }
    })

    modal.present();
  }

  async setNow() {
    // this.chooseWorkingHours(true);
    delete this.request.endDate;
    delete this.request.workingHours;
    this.request.startDate = moment();
    this.request.priority = true;
  }

  async chooseDay() {
    console.log(this.request);

    let componentProps;
    if (!this.request.priority)
      componentProps = { dateRange: { from: this.request.startDate, to: this.request.endDate } }

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
          this.request.priority = false;
          delete this.request.startDate;
          delete this.request.endDate;
          if (selectedWorkingHours) {
            this.request.startDate = data.from;
            if (!(data.from).isSame(data.to)) this.request.endDate = data.to;
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
          requestWorkingHours: this.request.workingHours ?? []
        }
      });

      modal.onWillDismiss().then(({ data }) => {
        if (data) {
          this.request.workingHours = data;
          if (data.length) this.request.priority = priority;
          else delete this.request.workingHours;
          resolve(data.length);
        } else {
          reject();
        }
      });

      modal.present();
    });
  }

  async addImage() {
    if (this.request.images.length > 5) return;

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
        this.request.images.push({ name: moment().unix().toString(), url: data.image });
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
          value: new FormControl(this.request[userProperty], validators),
        }),
        keyboardType,
      },
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.request[userProperty] = data.value;
      if (this.request[userProperty] === '') delete this.request[userProperty];
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
        this.ionContent.scrollToBottom();
      }
    });

    modal.present();
  }

}
