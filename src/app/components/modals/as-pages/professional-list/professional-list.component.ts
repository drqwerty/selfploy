import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProfessionalListTemplateComponent } from 'src/app/components/templates/professional-list-template/professional-list-template.component';
import { Plugins, Capacitor, StatusBarStyle } from '@capacitor/core';
import { Request } from 'src/app/models/request-model';
import { ServiceFilterComponent } from '../service-filter/service-filter.component';
import { Filters, FilterDefaultValues } from 'src/assets/filters';
import { Animations } from 'src/app/animations/animations';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-professional-listt',
  templateUrl: './professional-list.component.html',
  styleUrls: ['./professional-list.component.scss'],
})
export class ProfessionalListComponent {

  @Input() request: Request;

  @ViewChild('filterButton', { read: ElementRef }) filterButton: ElementRef;
  @ViewChild(ProfessionalListTemplateComponent) professionalList: ProfessionalListTemplateComponent;

  serviceName: string;
  categoryName: string;
  filterValues: Filters


  constructor(
    private modalController: ModalController,
    private animations: Animations,
  ) { }


  ionViewWillEnter() {
    this.serviceName = this.request.service;
    this.categoryName = this.request.category;

    this.filterValues = JSON.parse(JSON.stringify(FilterDefaultValues));
    if (!this.request.priority) this.filterValues.workingHours.value = this.request.workingHours;

    this.professionalList?.getProfessionalsFiltered(this.serviceName, this.categoryName, this.filterValues);
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }


  ionViewDidEnter() {
    this.professionalList.pageLoaded = true;
  }


  async filter() {
    const modal = await this.modalController.create({
      component: ServiceFilterComponent,
      animated: false,
      componentProps: {
        filterValues: JSON.parse(JSON.stringify(this.filterValues))
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {
        this.filterValues = data.filterValues;
        this.professionalList.filterResults(this.filterValues, data.resetFilters);
      }
    });

    await this.animations.addElement(this.filterButton.nativeElement, '#fff').startAnimation();

    modal.present();
  }


  goBack() {
    this.modalController.dismiss();
  }


  continue() {
    const professionalList = this.professionalList.professionals
      .filter(user => user.selectedForRequest)

    this.modalController.dismiss({ professionalList });
  }
}
