import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Categories, Category } from 'src/assets/categories';

import * as _ from 'lodash';


@Component({
  selector: 'app-service-picker',
  templateUrl: './service-picker.component.html',
  styleUrls: ['./service-picker.component.scss'],
})
export class ServicePickerComponent {

  @Input() userServices: any = {};

  categories = Categories;

  constructor(
    private modalController: ModalController,
  ) { }
  
  ionViewWillEnter() {
    this.setServicesSelected();
  }

  goBack() {
    this.modalController.dismiss();
  }
  
  accept() {
    this.getServicesSelected();
    this.modalController.dismiss(this.userServices);
  }

  cancel() {
    this.modalController.dismiss();
  }

  private setServicesSelected() {
    _.map(this.userServices, (srcServices: string[], srcCategory: string) => {
      const dstCategory = this.categories.find(
        category => category.name === srcCategory
      );

      if (srcServices.length === dstCategory.services.length) {
        dstCategory.checked = true;
      } else {
        dstCategory.indeterminateState = true;
      }

      srcServices.map(
        srcServiceName =>
          (dstCategory.services.find(
            dstService => dstService.name === srcServiceName
          ).checked = true)
      );
    });
  }

  private getServicesSelected() {
    this.userServices = {};
    this.categories.forEach(category => {
      if (category.checked) {
        this.userServices[category.name] = category.services.map(service => service.name);
      }
      else if (category.indeterminateState) {
        this.userServices[category.name] = [];
        category.services.forEach(service => {
          if (service.checked)
            this.userServices[category.name].push(service.name);
        });
      }
    });
  }

  updateCollapseState(category: Category) {
    category.collapsed = !category.collapsed;
  }

  updateServicesCheckbox(category: Category, event: Event) {
    event.stopPropagation();
    setTimeout(() => category.services.forEach(service => service.checked = category.checked));
  }

  updateCategoryCheckbox(category: Category) {
    const allItems = category.services.length;
    let selected = 0;

    category.services.map(service => { if (service.checked) selected++; });

    // One item selected
    if (0 < selected && selected < allItems) {
      category.indeterminateState = true;
      category.checked = false;

      // All item selected
    } else if (selected == allItems) {
      category.indeterminateState = false;
      category.checked = true;

      // No item selected
    } else {
      category.indeterminateState = false;
      category.checked = false;
    }
  }

}
