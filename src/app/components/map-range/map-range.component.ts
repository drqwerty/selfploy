import { Component, Input, ViewChild } from '@angular/core';
import { Map as leafletMap, tileLayer, icon, circle, marker, LatLng, Circle } from 'leaflet';

import { environment } from "src/environments/environment";
import { ModalController, IonRange } from '@ionic/angular';

import { Plugins, StatusBarStyle } from '@capacitor/core';
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

  @ViewChild(IonRange) ionRange: any;

  min = 1;
  max = 30;

  map: leafletMap;
  circleRadius: Circle;

  constructor(
    private modalController: ModalController,
  ) { }

  ionViewWillEnter() {
    StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewDidEnter() {
    this.loadMap();
    this.createMarker();
    this.createCircle();
    this.setPinText();
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

  setPinText() {
    const rangeSlider = this.ionRange.el.shadowRoot.querySelector('.range-slider') as HTMLElement;
    const rangeSliderRect = rangeSlider.getBoundingClientRect();
    const rangePing = this.ionRange.el.shadowRoot.querySelector('.range-pin') as HTMLElement;
    rangePing.style.whiteSpace = 'nowrap';

    const getValue = (ev) => {
      if (ev == null) return null;
      const clamp = (min, n, max) => Math.max(min, Math.min(n, max));
      const ratioToValue = (ratio, min, max) => clamp(min, Math.round((max - min) * ratio) + min, max);
      const ratio = clamp(0, (ev.x - rangeSliderRect.left) / rangeSliderRect.width, 1);
      return ratioToValue(ratio, this.min, this.max);
    }
    const setContent = (ev?) => rangePing.textContent = (getValue(ev) ?? this.radiusKm) + ' km';
    setContent();

    rangeSlider.addEventListener('pointerdown', ev => setContent(ev));
    rangeSlider.addEventListener('pointermove', ev => setContent(ev));
  }

}
