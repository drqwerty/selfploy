import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController } from '@ionic/angular';
import { User } from 'src/app/models/user-model';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { ServiceFilterComponent } from 'src/app/components/modals/as-pages/service-filter/service-filter.component';
import { Animations } from 'src/app/animations/animations';
import { DataService } from 'src/app/providers/data.service';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-professional-list',
  templateUrl: './professional-list.page.html',
  styleUrls: ['./professional-list.page.scss'],
})
export class ProfessionalListPage {

  @ViewChild('filterButton') filterButton: any;

  professionals: User[];

  serviceName: string;
  categoryName: string;

  pageLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navController: NavController,
    private data: DataService,
    private modalController: ModalController,
    private animations: Animations,
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
    this.professionals = await this.data.findProfessionalOf(this.categoryName, this.serviceName);
    console.table(this.professionals);
  }

  ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewDidEnter() {
    this.pageLoaded = true;
  }

  goBack() {
    this.navController.navigateBack('/tabs/categories/services', { state: { categoryName: this.categoryName } });
  }

  async filter() {
    const modal = await this.modalController.create({
      component: ServiceFilterComponent,
      animated: false,
      componentProps: { data: 'example' }
    });

    await this.animations.addElement(this.filterButton.el, '#fff').startAnimation();

    modal.present();
  }

}
