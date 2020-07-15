import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Categories } from 'src/assets/categories';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;
import { Animations } from 'src/app/animations/animations';
import { ServiceSearchComponent } from 'src/app/components/modals/as-pages/service-search/service-search.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage {

  @ViewChild('searchButton') searchButton: any;

  categories = Categories;

  constructor(
    private navController: NavController,
    private modalController: ModalController,
    private animations: Animations,
  ) { }


  ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }


  async search() {
    const modal = await this.modalController.create({
      component: ServiceSearchComponent,
      animated: false,
    });

    await this.animations.addElement(this.searchButton.el, '#fff').startAnimation();
    modal.present();
  }


  showServices(category) {
    this.navController.navigateForward('tabs/categories/services', { state: { category } });
  }


}
