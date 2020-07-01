import { Component, Input } from '@angular/core';
import { WorkingHours } from 'src/app/models/user-model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-request-working-hours-picker',
  templateUrl: './request-working-hours-picker.component.html',
  styleUrls: ['./request-working-hours-picker.component.scss'],
})
export class RequestWorkingHoursPickerComponent  {

  @Input() dateString: string;
  @Input() requestWorkingHours: WorkingHours[] = [];
  

  workingHours = [
    {
      name: WorkingHours.morning,
      checked: false
    },
    {
      name: WorkingHours.afternoon,
      checked: false
    },
    {
      name: WorkingHours.evening,
      checked: false
    },
    {
      name: WorkingHours.flexible,
      checked: false
    },
  ]

  constructor(
    private modalController: ModalController,
  ) { }

  ionViewWillEnter() {
    this.setWorkingHoursSelected();
  }

  accept() {
    this.getWorkingHoursSelected();
    this.modalController.dismiss(this.requestWorkingHours);
  }

  cancel() {
    this.modalController.dismiss();
  }

  setWorkingHoursSelected() {
    this.workingHours.forEach(workingHour =>
      workingHour.checked = this.requestWorkingHours?.includes(workingHour.name)
    );
  }

  getWorkingHoursSelected() {
    this.requestWorkingHours = [];
    this.workingHours.forEach(workingHour => {
      if (workingHour.checked) this.requestWorkingHours.push(workingHour.name);
    });
  }

}
