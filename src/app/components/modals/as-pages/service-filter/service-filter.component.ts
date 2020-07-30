import { Component, ViewChild, Input } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController } from '@ionic/angular';
import { FilterDefaultValues, Filters, Order } from 'src/assets/filters'
import { CustomRangeComponent } from 'src/app/components/utils/custom-range/custom-range.component';
import { WorkingHours } from 'src/app/models/user-model';

@Component({
  selector: 'app-service-filter',
  templateUrl: './service-filter.component.html',
  styleUrls: ['./service-filter.component.scss'],
})
export class ServiceFilterComponent {

  @Input() filterValues: Filters;


  @ViewChild(CustomRangeComponent) customRange: CustomRangeComponent;

  resetFilters = true;

  constructor(
    private animations: Animations,
    private modalController: ModalController,
  ) { }


  ionViewWillEnter() {

  }


  ionViewDidEnter() {
    this.animations.modalLoaded();
    this.customRange.setPinText();
  }


  async goBack() {
    await this.animations.startReverseAnimation();
    this.modalController.dismiss();
  }


  async apply() {
    await this.animations.startReverseAnimation();
    this.modalController.dismiss({
      filterValues: this.filterValues,
      resetFilters: this.resetFilters,
    });
  }


  rangeChange() {
    console.log(this.filterValues.distance.value);
    
    this.resetFilters = false;
  }


  setOrder(option: { name: Order, checked: boolean }) {
    const { value, options } = this.filterValues.order;

    if (option.checked) {
      value.ascendent = !value.ascendent;
    } else {
      options.find(({ checked }) => checked).checked = false;
      option.checked = true;
      value.ascendent = true;
      value.order = option.name;
    }
    this.resetFilters = false;
  }


  filterByClassification(option: { name: string, value: number, checked: boolean }) {
    const { classification } = this.filterValues;

    if (!option.checked) {
      classification.options.find(({ checked }) => checked).checked = false;
      option.checked = true;
      classification.value = option.value;
    }
    this.resetFilters = false;
  }


  filterByWorkingHours(option: { name: WorkingHours, checked: boolean }) {
    const { value } = this.filterValues.workingHours;

    option.checked = !option.checked;

    if (option.checked) {
      value.push(option.name)
    } else {
      const index = this.filterValues.workingHours.value.findIndex(s => s === option.name);
      if (index > -1) value.splice(index, 1);
    }
    this.resetFilters = false;
  }


  restartFilters() {
    this.filterValues = JSON.parse(JSON.stringify(FilterDefaultValues));
    this.customRange.setValue(30);
    setTimeout(() => {
      this.resetFilters = true;
    });
  }
}
