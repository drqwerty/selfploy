import { Component, ViewChild, ViewChildren, QueryList, AfterViewChecked, AfterViewInit } from '@angular/core';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { StorageService } from 'src/app/services/storage.service';

const { StatusBar } = Plugins;

import { Categories } from 'src/assets/categories';
import { User } from 'src/app/models/user-model';
import { IonContent } from '@ionic/angular';
import { SuperTab, SuperTabs, SuperTabButton } from '@ionic-super-tabs/angular';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
})
export class FavoritesPage implements AfterViewInit {

  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  @ViewChildren(SuperTab) superTabListQuery: QueryList<SuperTab>;

  superTabList: SuperTab[];
  lastTabIndex = 0;

  propagateScrollEvent = true;

  favorites: User[];
  favoriteReferencesByCategory: { [key: string]: number[] } = {};

  constructor(
    private storage: StorageService,
    private fStorage: FirestoreService,
  ) {
    // setTimeout(async () => storage.saveFavorites(await fStorage.getAllUsers()), 1000);
    this.getFavorites();
  }

  ngAfterViewInit() {
    this.superTabListQuery.changes.subscribe((change: QueryList<SuperTab>) => this.superTabList = change.toArray())
  }

  ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
  }

  async getFavorites() {
    this.favorites = await this.storage.getFavorites();
    this.classifyFavorites();
  }

  classifyFavorites() {
    Categories            // create keys
      .forEach(category => this.favoriteReferencesByCategory[category.name] = []);
    this.favorites        // classify by key
      .forEach(({ services }, index) => {
        if (!services) return;
        Object.keys(services)
          .forEach(k => this.favoriteReferencesByCategory[k].push(index));
      });
  }

  search() {

  }

  propagateScroll(e) {
    if (this.propagateScrollEvent) this.ionContent.scrollToPoint(0, e.detail.scrollTop);
  }

  async scrollLastTabToTop({ detail }) {
    this.propagateScrollEvent = false;
    (await this.superTabList[this.lastTabIndex].getRootScrollableEl()).scrollTo(0, 0);
    this.ionContent.scrollToTop(350);
    this.lastTabIndex = detail.index;
    this.propagateScrollEvent = true;
  }

  goToTab(event = null) {
    const index = event ? parseInt((event.el as HTMLElement).getAttribute('index')) : 0;
    this.superTabs.selectTab(index);
  }

}
