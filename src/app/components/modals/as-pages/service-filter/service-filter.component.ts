import { Component, ViewChild } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController, IonRange } from '@ionic/angular';
import { FilterDefaultValues, Filters } from 'src/assets/filters'
import { CustomRangeComponent } from 'src/app/components/utils/custom-range/custom-range.component';

@Component({
  selector: 'app-service-filter',
  templateUrl: './service-filter.component.html',
  styleUrls: ['./service-filter.component.scss'],
})
export class ServiceFilterComponent {

  @ViewChild(CustomRangeComponent) customRange: CustomRangeComponent;

  filterValues: Filters = JSON.parse(JSON.stringify(FilterDefaultValues));

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

  rangeChange() {
    // console.log(this.filterValues.distance.value);
  }

  orderByName() {

  }

  filterByClassification() {

  }

  filterByWorkingHours() {

  }


  apply() {

  }

  restartFilters() {

  }
}
