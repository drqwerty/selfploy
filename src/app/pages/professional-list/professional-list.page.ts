import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { ServiceFilterComponent } from 'src/app/components/modals/as-pages/service-filter/service-filter.component';
import { Animations } from 'src/app/animations/animations';
import { ProfessionalListTemplateComponent } from 'src/app/components/templates/professional-list-template/professional-list-template.component';
import { Filters, FilterDefaultValues } from 'android/app/build/intermediates/merged_assets/debug/out/public/assets/filters';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-professional-list',
  templateUrl: './professional-list.page.html',
  styleUrls: ['./professional-list.page.scss'],
})
export class ProfessionalListPage {

  @ViewChild('filterButton', { read: ElementRef }) filterButton: ElementRef;
  @ViewChild(ProfessionalListTemplateComponent) professionalList: ProfessionalListTemplateComponent;

  filterValues: Filters = JSON.parse(JSON.stringify(FilterDefaultValues));

  serviceName: string;
  categoryName: string;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
    private modalController: ModalController,
    private animations: Animations,
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.serviceName = this.router.getCurrentNavigation().extras.state?.serviceName;
        this.categoryName = this.router.getCurrentNavigation().extras.state?.categoryName;
      }
    });
  }


  ionViewWillEnter() {
    if (!this.professionalList.pageLoaded) 
      this.professionalList?.getProfessionals(this.serviceName, this.categoryName);
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }


  ionViewDidEnter() {
    this.professionalList.pageLoaded = true;
  }


  goBack() {
    this.navController.navigateBack('/tabs/categories/services', { state: { categoryName: this.categoryName } });
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

}
