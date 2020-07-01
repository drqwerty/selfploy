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

  @Input() title: string;
  @Input() userServices: { [key: string]: string[] } = {};
  @Input() limit = 0;


  serviceSelectedWithLimit = [];
  canUpdate = true;

  categories = JSON.parse(JSON.stringify(Categories));

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
    if (this.limit) this.getServicesSelectedWithLimit();
    else this.getServicesSelected();

    this.modalController.dismiss(this.userServices);
  }

  cancel() {
    this.modalController.dismiss();
  }

  private setServicesSelected() {
    this.canUpdate = false;
    _.forEach(this.userServices, (srcServices: string[], srcCategory: string) => {
      if (!srcServices[0]) return;
      
      const dstCategory = this.categories.find(category => category.name === srcCategory);

      if (srcServices.length === dstCategory.services.length)
        dstCategory.checked = true;
      else dstCategory.indeterminateState = true;

      srcServices.forEach(srcServiceName => {
        const service = dstCategory.services.find(dstService => dstService.name === srcServiceName);
        service.checked = true;

        if (this.limit) this.serviceSelectedWithLimit.push({ category: dstCategory, service });
      });
    });
    setTimeout(() => this.canUpdate = true);
  }

  private getServicesSelected() {
    this.userServices = {};
    this.categories.forEach(category => {
      if (category.checked) {
        this.userServices[category.name] = category.services.map(service => service.name);
      } else if (category.indeterminateState) {
        this.userServices[category.name] = [];
        category.services.forEach(service => {
          if (service.checked)
            this.userServices[category.name].push(service.name);
        });
      }
    });
  }

  private getServicesSelectedWithLimit() {
    this.userServices = {};
    this.serviceSelectedWithLimit.forEach(el => {
      if (this.userServices[el.category.name] != null)
        this.userServices[el.category.name].push(el.service.name);
      else this.userServices[el.category.name] = [el.service.name];
    });
    this.serviceSelectedWithLimit;
  }

  updateCollapseState(category: Category) {
    category.collapsed = !category.collapsed;
  }

  updateServicesCheckbox(category: Category, event: Event) {
    event.stopPropagation();
    setTimeout(() => category.services.forEach(service => service.checked = category.checked));
  }

  updateCategoryCheckbox(service: any, category: Category) {
    if (this.limit) {
      if (this.canUpdate) {
        this.canUpdate = false;
        if (service.checked) {
          if (this.serviceSelectedWithLimit.length >= this.limit) this.serviceSelectedWithLimit.shift().service.checked = false;
          this.serviceSelectedWithLimit.push({ category, service });
        } else {
          this.serviceSelectedWithLimit.pop();
        }
        setTimeout(() => this.canUpdate = true);
      }
      return;
    }

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
