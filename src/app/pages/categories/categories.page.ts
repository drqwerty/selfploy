import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavController, Platform, IonContent } from '@ionic/angular';
import { Categories, Category } from 'src/assets/categories';

import { Plugins, StatusBarStyle } from '@capacitor/core';
import { CustomHeaderComponent } from 'src/app/components/custom-header/custom-header.component';
import { isContext } from 'vm';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage {

  @ViewChild(CustomHeaderComponent) customHeader: CustomHeaderComponent;
  @ViewChild(IonContent) ionContent: IonContent;

  firstEnter = true;

  categories = Categories;

  constructor(
  ) { }

  ionViewWillEnter() {
    StatusBar.setStyle({ style: StatusBarStyle.Light });
    if (this.firstEnter) this.updateTitle(0);
    this.firstEnter = false;
  }

  updateTitle(scrollTop: number) {
    this.customHeader.updateHeaderTitle(scrollTop);
  }

  showServices(services) {
    console.log(services);
    
  }


}
