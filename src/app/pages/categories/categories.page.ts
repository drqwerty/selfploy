import { Component, ViewChild } from '@angular/core';
import { NavController, IonContent, ModalController } from '@ionic/angular';
import { Categories, Category } from 'src/assets/categories';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { CustomHeaderComponent } from 'src/app/components/custom-header/custom-header.component';
const { StatusBar } = Plugins;
import { Animations } from 'src/app/animations/animations';
import { ServiceSearchComponent } from 'src/app/components/service-search/service-search.component';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild('searchButton') searchButton: any;

  firstEnter = true;
  categories = Categories;

  constructor(
    private navController: NavController,
    private modalController: ModalController,
    private animations: Animations,
  ) { }

  ionViewWillEnter() {
    if (this.firstEnter) {
      this.updateTitle(0);
    } else if (Capacitor.isPluginAvailable('StatusBar')) {
      StatusBar.setStyle({ style: StatusBarStyle.Light })
    }
    this.firstEnter = false;
  }

  async search() {
    const modal = await this.modalController.create({
      component: ServiceSearchComponent,
      animated: false,
    });

    await this.animations.addElement(this.searchButton.el, '#fff').startAnimation();
    modal.present();
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

  showServices(category) {
    this.navController.navigateForward('tabs/categories/services', { state: { category } });
  }


}
