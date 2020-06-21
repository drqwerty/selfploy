import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WorkingHours } from 'src/app/models/user-model';

@Component({
  selector: 'app-working-hours-picker',
  templateUrl: './working-hours-picker.component.html',
  styleUrls: ['./working-hours-picker.component.scss'],
})
export class WorkingHoursPickerComponent {

  @Input() title: string;
  @Input() userWorkingHours: WorkingHours[] = [];


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
    this.modalController.dismiss(this.userWorkingHours);
  }

  cancel() {
    this.modalController.dismiss();
  }

  setWorkingHoursSelected() {
    this.workingHours.forEach(workingHour =>
      workingHour.checked = this.userWorkingHours?.includes(workingHour.name)
    );
  }

  getWorkingHoursSelected() {
    this.userWorkingHours = [];
    this.workingHours.forEach(workingHour => {
      if (workingHour.checked) this.userWorkingHours.push(workingHour.name);
    });
  }

}
