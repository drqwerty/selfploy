import { Component, ViewChild, Input } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController, IonSearchbar, NavController } from '@ionic/angular';
import { Categories } from 'src/assets/categories';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;
import Utils from "src/app/utils";


@Component({
  selector: 'app-service-search',
  templateUrl: './service-search.component.html',
  styleUrls: ['./service-search.component.scss'],
})
export class ServiceSearchComponent {

  @Input() categoryFilter: string;


  @ViewChild(IonSearchbar) searchbar: IonSearchbar;

  hideHeaderBorder = true;

  categories = Categories;
  servicesQuery = [];
  professionalsQuery = [];

  constructor(
    private modalController: ModalController,
    private animations: Animations,
    private firestoreService: FirestoreService,
    private navController: NavController,
  ) { }

  ionViewDidEnter() {
    this.animations.modalLoaded();
    setTimeout(() => this.searchbar.setFocus(), 250);
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  async goBack() {
    await this.animations.startReverseAnimation();
    this.modalController.dismiss();
  }

  updateHeaderShadow(scrollTop: number) {
    this.hideHeaderBorder = scrollTop === 0;
  }

  searchQuery({ detail }) {
    this.findServices(detail.value);
    this.findUsers(detail.value);
  }

  async showProfessionals(categoryName, serviceName) {
    this.navController.navigateForward('/tabs/categories/services/professional-list', { state: { categoryName, serviceName } });
    setTimeout(() => this.goBack(), 300);
  }

  async findServices(text) {
    this.servicesQuery = [];
    if (text == '') return;
    const val = Utils.normalize(text);

    if (this.categoryFilter) {
      Categories
        .find(category => category.name === this.categoryFilter).services
        .forEach(service => {
          if (Utils.normalize(service.name).includes(val)) this.servicesQuery.push({ category: this.categoryFilter, name: service.name });
        });

    } else {
      Categories
        .forEach(category => {
          if (Utils.normalize(category.name).includes(val)) {
            category.services.forEach(service => this.servicesQuery.push({ category: category.name, name: service.name }));
          } else {
            category.services.forEach(service => {
              if (Utils.normalize(service.name).includes(val)) this.servicesQuery.push({ category: category.name, name: service.name });
            });
          }
        });
    }
  }

  async findUsers(text) {
    this.professionalsQuery = null;
    this.professionalsQuery = (text == '') ? [] : await this.firestoreService.findUserByName(text, this.categoryFilter);
  }
}
