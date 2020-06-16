import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CustomHeaderComponent } from 'src/app/components/custom-header/custom-header.component';

@Component({
  selector: 'app-professional-list',
  templateUrl: './professional-list.page.html',
  styleUrls: ['./professional-list.page.scss'],
})
export class ProfessionalListPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;

  firstEnter = true;

  service: string

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
  ) {
    this.route.queryParams.subscribe(() => this.service = this.router.getCurrentNavigation().extras.state?.service);
  }

  ionViewWillEnter() {
    if (this.firstEnter) this.updateTitle(0);
    this.firstEnter = false;
  }

  goBack() {
    this.navController.navigateBack('/tabs/categories/services');
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

}
