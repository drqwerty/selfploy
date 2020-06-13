import { Component, Input, ViewChild } from '@angular/core';
import { Animations } from 'src/app/animations/animations';
import { ModalController, IonSearchbar } from '@ionic/angular';
// import { Geocoding } from "esri-leaflet";
import * as Geocoding from 'esri-leaflet-geocoder';
import { Subject } from 'rxjs';
import { LatLng, LatLngBounds } from 'leaflet';

@Component({
  selector: 'app-map-search',
  templateUrl: './map-search.component.html',
  styleUrls: ['./map-search.component.scss'],
})
export class MapSearchComponent {

  @Input() locationSearched: Subject<LatLngBounds>;
  @Input() mapCenter: LatLng;

  @ViewChild(IonSearchbar) searchbar: IonSearchbar;

  geocodeService;
  suggestions = []

  constructor(
    private animations: Animations,
    private modalController: ModalController,
  ) {
    this.geocodeService = (Geocoding as any).geocodeService();
  }

  ionViewDidEnter() {
    setTimeout(() => this.searchbar.setFocus(), 250);
  }

  async goBack() {
    await this.animations.startReverseAnimation();
    this.modalController.dismiss();
  }

  searchQuery({ detail }) {
    this.geocodeService.suggest().text(detail.value).nearby(this.mapCenter).run((error, results) =>
      this.suggestions = results?.suggestions ?? []
    )
  }

  getGeopoint(result) {
    this.geocodeService.geocode().text(result.text).key(result.magicKey).run((err, result) => {
      if (err) return;
      this.locationSearched.next(result.results[0].bounds);
      this.goBack();
    });
  }

}
