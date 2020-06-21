import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { CustomHeaderComponent } from 'src/app/components/utils/custom-header/custom-header.component';
import { FirestoreService } from 'src/app/services/firestore.service';
import { User } from 'src/app/models/user-model';

@Component({
  selector: 'app-professional-list',
  templateUrl: './professional-list.page.html',
  styleUrls: ['./professional-list.page.scss'],
})
export class ProfessionalListPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;

  professionals: User[]

  firstEnter = true;

  serviceName: string
  categoryName: string;

  pageLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
    private firestoreService: FirestoreService,
  ) {
    this.route.queryParams.subscribe(() => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.serviceName = this.router.getCurrentNavigation().extras.state?.serviceName;
        this.categoryName = this.router.getCurrentNavigation().extras.state?.categoryName;
        this.getProfessionals();
      }
    });
  }

  async getProfessionals() {
    this.professionals = await this.firestoreService.findProfessionalOf(this.categoryName, this.serviceName);
    console.table(this.professionals);
  }

  ionViewWillEnter() {
    if (this.firstEnter) this.updateTitle(0);
    this.firstEnter = false;
  }

  ionViewDidEnter() {
    this.pageLoaded = true;
  }

  goBack() {
    this.navController.navigateBack('/tabs/categories/services', { state: { categoryName: this.categoryName } });
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

}
