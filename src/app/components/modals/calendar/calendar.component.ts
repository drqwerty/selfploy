import { Component, Input } from '@angular/core';
import { CalendarComponentOptions } from 'ion2-calendar';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent {

  @Input() dateRange: { from: moment.Moment; to: moment.Moment; } = { from: null, to: null };
  type: 'string'; // 'string' | 'js-date' | 'moment' | 'time' | 'object'
  optionsRange: CalendarComponentOptions = {
    from: this.dateRange.from?.date(),
    to: this.dateRange.to?.date(),
    pickMode: 'range',
    weekStart: 1,
    weekdays: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthFormat: "MMMM YYYY",
    monthPickerFormat: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DEC']
  };

  constructor(private modalController: ModalController) { }

  cancel() {
    this.modalController.dismiss();
  }

  done() {
    if (!this.dateRange.to) this.dateRange.to = this.dateRange.from;
    this.modalController.dismiss(this.dateRange);
  }

  startSelected(event) {
    this.dateRange.to = this.dateRange.from = moment(event.time);
  }

  endSelected(event) {
    this.dateRange.to = event;
  }

}
