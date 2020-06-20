import { Component, Input, ViewChild } from '@angular/core';
import { Category } from 'src/assets/categories';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomHeaderComponent } from 'src/app/components/custom-header/custom-header.component';
import { NavController } from '@ionic/angular';

import * as _ from 'lodash';
import { Categories } from 'android/app/build/intermediates/merged_assets/debug/out/public/assets/categories';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;

  category: Category;
  categoryName: Category;

  firstEnter = true;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state?.category)
        this.category = this.router.getCurrentNavigation().extras.state?.category;
      if (!this.category && this.router.getCurrentNavigation().extras.state?.categoryName) {
        this.category = Categories.find(category => category.name === this.router.getCurrentNavigation().extras.state?.categoryName)
      }

      // this.categoryName = this.router.getCurrentNavigation().extras.state.categoryName;
    });
  }

  ionViewWillEnter() {
    if (this.firstEnter) this.updateTitle(0);
    this.firstEnter = false;
  }

  goBack() {
    this.navController.navigateBack('/tabs/categories');
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

  showProfessionals(categoryName, serviceName) {
    this.navController.navigateForward('/tabs/categories/services/professional-list', { state: { categoryName, serviceName } })
  }

}
