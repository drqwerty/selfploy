import { Component, ViewChild, ViewChildren, QueryList, AfterViewChecked, AfterViewInit } from '@angular/core';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;
import { Categories } from 'src/assets/categories';
import { User } from 'src/app/models/user-model';
import { IonContent, ModalController } from '@ionic/angular';
import { SuperTab, SuperTabs } from '@ionic-super-tabs/angular';
import { Animations } from 'src/app/animations/animations';
import { FavoriteSearchComponent } from 'src/app/components/modals/as-pages/favorite-search/favorite-search.component';
import { trigger, transition, animate, style, sequence } from '@angular/animations';
import { DataService } from 'src/app/providers/data.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  animations: [
    trigger('cardItem', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate(".25s ease", style({ transform: 'translateX(20%)', opacity: 0, })),
      ])
    ])
  ]
})
export class FavoritesPage implements AfterViewInit {

  @ViewChild('searchButton') searchButton: any;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  @ViewChildren(SuperTab) superTabListQuery: QueryList<SuperTab>;

  superTabList: SuperTab[];
  lastTabIndex = 0;

  propagateScrollEvent = true;

  favorites: User[];
  favoriteReferencesByCategory: { [key: string]: number[] } = {};

  constructor(
    private data: DataService,
    private modalController: ModalController,
    private animations: Animations,
  ) {
    data.favoritesChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(() => this.getFavorites());
  }

  ngAfterViewInit() {
    this.superTabListQuery.changes.subscribe((change: QueryList<SuperTab>) => this.superTabList = change.toArray())
  }

  ionViewWillEnter() {
    this.getFavorites();
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  async getFavorites() {
    const favs = await this.data.getFavoriteList();
    if (favs !== this.favorites) {
      this.favorites = favs;
      this.classifyFavorites();
    }
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

  async search() {
    const modal = await this.modalController.create({
      component: FavoriteSearchComponent,
      componentProps: { favorites: this.favorites },
      animated: false,
    });

    await this.animations.addElement(this.searchButton.el, '#fff').startAnimation();

    modal.present();
  }

  propagateScroll({ scrollTop }) {
    if (this.propagateScrollEvent) this.ionContent.scrollToPoint(0, scrollTop);
  }

  async scrollLastTabToTop({ detail }) {
    const { index } = detail;

    if (this.lastTabIndex != index) {
      this.propagateScrollEvent = false;
      (await this.superTabList[this.lastTabIndex].getRootScrollableEl()).scrollTo(0, 0);
      this.ionContent.scrollToTop(350);
      this.lastTabIndex = index;
      this.propagateScrollEvent = true;
    }
  }

  goToTab(event = null) {
    const index = event ? parseInt((event.el as HTMLElement).getAttribute('index')) : 0;
    this.superTabs.selectTab(index);
  }

}
