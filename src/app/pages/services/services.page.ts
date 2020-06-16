import { Component, Input, ViewChild } from '@angular/core';
import { Category } from 'src/assets/categories';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomHeaderComponent } from 'src/app/components/custom-header/custom-header.component';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;

  category: Category;

  firstEnter = true;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
  ) {
    this.route.queryParams.subscribe(() => this.category = this.router.getCurrentNavigation().extras.state?.category);
  }

  ionViewWillEnter() {
    console.log(this.category);
    if (this.firstEnter) this.updateTitle(0);
    this.firstEnter = false;
  }

  goBack() {
    this.navController.navigateBack('/tabs/categories');
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

}
