import { Component, Input, ViewChild } from '@angular/core';
import { Map as leafletMap, tileLayer, icon, circle, marker, LatLng, Circle } from 'leaflet';

import { environment } from "src/environments/environment";
import { ModalController } from '@ionic/angular';
import { CustomRangeComponent } from 'src/app/components/utils/custom-range/custom-range.component';

import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;

@Component({
  selector: 'app-map-range',
  templateUrl: './map-range.component.html',
  styleUrls: ['./map-range.component.scss'],
})
export class MapRangeComponent {

  _radiusKm: number;
  @Input()
  set radiusKm(val: number) { this._radiusKm = val ?? 0 }
  get radiusKm(): number { return this._radiusKm }

  @Input() coordinates: LatLng;


  @ViewChild(CustomRangeComponent) customRange: CustomRangeComponent;

  map: leafletMap;
  circleRadius: Circle;

  constructor(
    private modalController: ModalController,
  ) { }

  ionViewWillEnter() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewDidEnter() {
    this.loadMap();
    this.createMarker();
    this.createCircle();
    this.customRange.setPinText();
  }

  goBack() {
    this.modalController.dismiss();
  }

  accept() {
    this.modalController.dismiss(this.radiusKm);
  }

  loadMap() {
    const urlApiMapbox = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    this.map = new leafletMap('map-range', { zoomControl: false, attributionControl: false }).setView(this.coordinates, 15);
    tileLayer(urlApiMapbox, { accessToken: environment.mapboxConfig.apiKey, id: 'streets-v11' }).addTo(this.map);
  }

  createMarker() {
    marker(this.coordinates, {
      icon: icon({
        iconUrl: '../../../assets/marker-icon.svg',
        iconSize: [26, 40],
        iconAnchor: [13, 40],
      })
    }).addTo(this.map);
  }

  createCircle() {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');

    this.circleRadius = circle(this.coordinates, {
      color,
      fillOpacity: 0.3,
      radius: this.radiusKm * 1000,
      stroke: false,
    });

    this.circleRadius.addTo(this.map);
    if (this.radiusKm != 0) this.map.fitBounds(this.circleRadius.getBounds());
  }

  updateCircleRadius() {
    if (this.circleRadius == null) return;
    this.circleRadius.setRadius(this.radiusKm * 1000);
    this.map.fitBounds(this.circleRadius.getBounds());
    setTimeout(() => this.map.fitBounds(this.circleRadius.getBounds()), 250);
  }

}
