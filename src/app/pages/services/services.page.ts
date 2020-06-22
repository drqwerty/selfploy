import { Component, Input, ViewChild } from '@angular/core';
import { Category } from 'src/assets/categories';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomHeaderComponent } from 'src/app/components/utils/custom-header/custom-header.component';
import { NavController, ModalController } from '@ionic/angular';

import * as _ from 'lodash';
import { Categories } from 'android/app/build/intermediates/merged_assets/debug/out/public/assets/categories';
import { Animations } from 'src/app/animations/animations';
import { ServiceSearchComponent } from 'src/app/components/modals/as-pages/service-search/service-search.component';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;


@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;
  @ViewChild('searchButton') searchButton: any;

  category: Category;
  firstEnter = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
    private modalController: ModalController,
    private animations: Animations,
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state?.category)
        this.category = this.router.getCurrentNavigation().extras.state?.category;
      if (!this.category && this.router.getCurrentNavigation().extras.state?.categoryName) {
        this.category = Categories.find(category => category.name === this.router.getCurrentNavigation().extras.state?.categoryName)
      }
    });
  }

  ionViewWillEnter() {
    if (this.firstEnter) this.updateTitle(0);
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
    this.firstEnter = false;
  }

  goBack() {
    this.navController.navigateBack('/tabs/categories');
  }

  async search() {
    const modal = await this.modalController.create({
      component: ServiceSearchComponent,
      animated: false,
      componentProps: {
        categoryFilter: this.category.name,
      },
    });

    await this.animations.addElement(this.searchButton.el, '#fff').startAnimation();
    modal.present();
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

  showProfessionals(categoryName, serviceName) {
    this.navController.navigateForward('/tabs/categories/services/professional-list', { state: { categoryName, serviceName } })
  }

}
