import { Component, ViewChild, Input } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController, IonSearchbar } from '@ionic/angular';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;
import Utils from "src/app/utils";
import { User } from 'src/app/models/user-model';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DataService } from 'src/app/providers/data.service';

@UntilDestroy()
@Component({
  selector: 'app-favorite-search',
  templateUrl: './favorite-search.component.html',
  styleUrls: ['./favorite-search.component.scss'],
})
export class FavoriteSearchComponent {

  @Input() favorites: User[];


  @ViewChild(IonSearchbar) searchbar: IonSearchbar;

  hideHeaderBorder = true;

  favoritesQuery = [];
  queryText: string;

  constructor(
    private modalController: ModalController,
    private animations: Animations,
    private data: DataService,
  ) { }

  ionViewDidEnter() {
    this.animations.modalLoaded();
    setTimeout(() => this.searchbar.setFocus(), 250);
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewWillEnter() {
    this.data.favoritesChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(async () => {
        this.favorites = await this.data.getFavorites();
        this.findUsers();
      })
  }

  async goBack() {
    await this.animations.startReverseAnimation();
    this.modalController.dismiss();
  }

  updateHeaderShadow(scrollTop: number) {
    this.hideHeaderBorder = scrollTop === 0;
  }

  findUsers(text = this.queryText) {
    this.queryText = text;
    this.clearResultData();
    if (text == '') return;
    this.favoritesQuery = this.favorites.filter(favorite =>
      Utils.normalize(favorite.name).includes(Utils.normalize(text))
    );
  }

  clearResultData() {
    this.favoritesQuery = null;
  }
}
