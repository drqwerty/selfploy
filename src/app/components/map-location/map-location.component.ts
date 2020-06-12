import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Map as leafletMap, tileLayer, control, Control, LatLng } from 'leaflet';
import 'leaflet.locatecontrol';
import * as Geocoding from 'esri-leaflet-geocoder';
import { Animation, createAnimation } from '@ionic/core';

import { environment } from "src/environments/environment";

import { Plugins, StatusBarStyle, PermissionType } from '@capacitor/core';
const { StatusBar, Geolocation, Permissions } = Plugins;

@Component({
  selector: 'app-map-location',
  templateUrl: './map-location.component.html',
  styleUrls: ['./map-location.component.scss'],
})
export class MapLocationComponent {

  _coordinates  // default: Gran Canaria
  @Input()
  set coordinates(val: LatLng) { this._coordinates = val ?? new LatLng(28, -15.6); }
  get coordinates(): LatLng { return this._coordinates }

  @Input() hideLocationAccuracy: boolean;
  @Input() addressFull: string;
  @Input() addressCity: string;


  @ViewChild('innerLocationCircle') animationElement: ElementRef;

  map: leafletMap;
  lc: Control.Locate;
  geocodeService: any;

  animation: Animation;
  locationStatus: 'searching' | 'found' | undefined;
  skipEvents = false;
  myLocationColor: 'tertiary' | 'primary' = 'tertiary';


  constructor(
    private modalController: ModalController,
    private platform: Platform,
  ) { }

  ionViewWillEnter() {
    this.createMyLocationAnimation();
    StatusBar.setStyle({ style: StatusBarStyle.Light });
  }

  ionViewDidEnter() {
    this.loadMap();
    this.loadMapEvents();
  }

  ionViewDidLeave() {
    this.lc.stop();
  }

  goBack() {
    this.modalController.dismiss();
  }

  accept() {
    this.modalController.dismiss({
      hideLocationAccuracy: this.hideLocationAccuracy ?? false,
      addressFull: this.addressFull,
      addressCity: this.addressCity,
      coordinates: this.coordinates,
    });
  }

  loadMap() {
    const urlApiMapbox = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    const zoom = this.addressCity == null ? 9 : 16;
    this.map = new leafletMap('map', { zoomControl: false, attributionControl: false }).setView(this.coordinates, zoom);
    tileLayer(urlApiMapbox, { accessToken: environment.mapboxConfig.apiKey, id: 'streets-v11' }).addTo(this.map);

    this.lc = control
      .locate({
        locateOptions: {
          setView: true,
          maxZoom: 18,
          enableHighAccuracy: true,
        },
      })
      .addTo(this.map);
    this.lc.getContainer().classList.add('ion-hide');
    this.geocodeService = (Geocoding as any).geocodeService();
  }

  async locate() {
    // in android forces the location to be requested again if it had already been requested
    // without this, the second time a map is loaded it takes up to a minute to "find" the user's location
    if (this.platform.is('capacitor') && this.platform.is('android')) Geolocation.getCurrentPosition();

    const { state } = await Permissions.query({ name: PermissionType.Geolocation });

    if (state == 'denied') Geolocation.requestPermissions().then(() => this.lc.start());
    else this.lc.start();

    if (this.locationStatus == 'found') {
      this.skipMapEvents();
      this.setColorMyLocationButton('primary');
    } else {
      this.locationStatus = 'searching';
      this.animation.play();
    }
  }

  loadMapEvents() {
    this.map.on('locationfound', () => {
      this.locationStatus = 'found';
      this.skipMapEvents();
      this.animation.stop();
      this.setColorMyLocationButton('primary');
    });

    this.map.on('zoomstart', () => this.setColorMyLocationButton('tertiary'));
    this.map.on('dragstart', () => this.setColorMyLocationButton('tertiary'));

    this.map.on('moveend', () => {
      this.coordinates = this.map.getCenter();
      this.geocodeService.reverse().latlng(this.coordinates).run((error, { address }) => {
        if (error) return;
        this.addressFull = address.LongLabel;
        if (address.Addr_type === 'Postal') this.addressFull += ', ' + address.City + ', ' + address.Subregion + ', ' + address.Region;
        this.addressCity = address.City;
      });
    });
  }

  search() {
    // console.log(this.sitios);
  }

  setColorMyLocationButton(color: 'primary' | 'tertiary') {
    if (color == 'primary') this.myLocationColor = 'primary';
    else if (!this.skipEvents) this.myLocationColor = 'tertiary';
  }

  skipMapEvents() {
    this.skipEvents = true;
    setTimeout(() => this.skipEvents = false, 250);
  }

  createMyLocationAnimation() {
    this.animation = createAnimation()
      .addElement(this.animationElement.nativeElement)
      .duration(1000)
      .easing('ease-out')
      .iterations(Infinity)
      .direction('alternate')
      .fromTo('transform', 'scale(1)', 'scale(.7)');
  }

}
