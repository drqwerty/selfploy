import { Component, ViewChild, ElementRef, Input, Renderer2 } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { Map as leafletMap, tileLayer, control, Control, LatLng, LatLngBounds } from 'leaflet';
import 'leaflet.locatecontrol';
import * as Geocoding from 'esri-leaflet-geocoder';
import { Animation, createAnimation } from '@ionic/core';
import { environment } from "src/environments/environment";
import { Plugins, StatusBarStyle, PermissionType } from '@capacitor/core';
import { MapSearchComponent } from '../map-search/map-search.component';
import { Animations } from 'src/app/animations/animations';
import { Subject } from 'rxjs';
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
  @ViewChild('tooltip') tooltip: ElementRef;
  @ViewChild('fab') fab: any;

  map: leafletMap;
  lc: Control.Locate;
  geocodeService: any;
  goToLocationOnFound = false;
  locationSearched: Subject<LatLngBounds> = new Subject();

  tooltipAnimation: Animation;
  locationButtonAnimation: Animation;
  locationStatus: 'searching' | 'found' | undefined;
  skipEvents = false;
  myLocationColor: 'tertiary' | 'primary' = 'tertiary';


  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private animations: Animations,
    private renderer: Renderer2,
  ) { }

  ionViewWillEnter() {
    this.createMyLocationAnimation();
    StatusBar.setStyle({ style: StatusBarStyle.Light });
    this.locationSearched.subscribe(val => this.map.flyToBounds(val));
  }

  ionViewDidEnter() {
    this.loadMap();
    this.loadMapEvents();
    this.locate(false);
    this.showTooltipIfNeeded();
  }

  ionViewDidLeave() {
    this.locationSearched.complete();
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
    this.map = new leafletMap('map-location', { zoomControl: false, attributionControl: false }).setView(this.coordinates, zoom);
    tileLayer(urlApiMapbox, { accessToken: environment.mapboxConfig.apiKey, id: 'streets-v11' }).addTo(this.map);

    this.lc = control
      .locate({
        locateOptions: {
          setView: false,
          maxZoom: 18,
          enableHighAccuracy: true,
        },
        showPopup: false,
        setView: true,
      })
      .addTo(this.map);
    this.lc.getContainer().classList.add('ion-hide');
    this.geocodeService = (Geocoding as any).geocodeService();
  }

  loadMapEvents() {
    this.map.on('locationfound', () => {
      this.locationStatus = 'found';
      this.skipMapEvents();
      this.locationButtonAnimation.stop();
      this.setColorMyLocationButton('primary');
      if (this.goToLocationOnFound) setTimeout(() => this.lc.start());
    });

    this.map.on('zoomstart', () => {
      this.setColorMyLocationButton('tertiary');
      this.tooltipToggleVisibily(false);
    });
    this.map.on('dragstart', () => {
      this.setColorMyLocationButton('tertiary');
      this.tooltipToggleVisibily(false);
    });

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

  async search() {
    const modal = await this.modalController.create({
      component: MapSearchComponent,
      animated: false,
      componentProps: {
        locationSearched: this.locationSearched,
        mapCenter: this.map.getCenter(),
      }
    });
    await this.animations.addElement(this.fab.el, 'light').startAnimation();
    modal.present();
  }

  async locate(requestPersmission = true) {
    if (requestPersmission) this.goToLocationOnFound = true;
    if (this.locationStatus === 'searching') return;

    // in android forces the location to be requested again if it had already been requested
    // without this, the second time a map is loaded it takes up to a minute to "find" the user's location
    if (this.platform.is('capacitor') && this.platform.is('android')) Geolocation.getCurrentPosition();

    const { state } = await Permissions.query({ name: PermissionType.Geolocation });
    switch (state) {
      case 'granted':
        this.startGeolocationAndUpdateButton();
        break;
      case 'denied':
        if (requestPersmission) Geolocation.requestPermissions().then(() => this.startGeolocationAndUpdateButton());
        break;
      case 'prompt':
        if (requestPersmission) navigator.geolocation.getCurrentPosition(() => this.startGeolocationAndUpdateButton());
    }
  }

  async startGeolocationAndUpdateButton() {
    const { state } = await Permissions.query({ name: PermissionType.Geolocation });
    if (state !== 'granted') return;
    if (this.locationStatus === 'found') {
      this.skipMapEvents();
      this.setColorMyLocationButton('primary');
    } else {
      this.locationStatus = 'searching';
      this.locationButtonAnimation.play();
    }
    this.lc.start();
  }

  setColorMyLocationButton(color: 'primary' | 'tertiary') {
    if (color == 'primary' && this.goToLocationOnFound) this.myLocationColor = 'primary';
    else if (!this.skipEvents) this.myLocationColor = 'tertiary';
  }

  skipMapEvents() {
    this.skipEvents = true;
    setTimeout(() => this.skipEvents = false, 250);
  }

  showTooltipIfNeeded() {
    if (this.addressFull == null || this.addressFull == '') {
      this.createTooltipAnimation();
      this.tooltipToggleVisibily(true);
    }
  }

  async tooltipToggleVisibily(show: boolean) {
    if (show) {
      this.tooltipAnimation.play();
    } else if (this.tooltipAnimation) {
      await this.tooltipAnimation.direction('reverse').duration(300).afterRemoveClass('show').play();
      this.tooltipAnimation = null;
    }
  }

  createMyLocationAnimation() {
    this.locationButtonAnimation = createAnimation()
      .addElement(this.animationElement.nativeElement)
      .duration(1000)
      .easing('ease-out')
      .iterations(Infinity)
      .direction('alternate')
      .fromTo('transform', 'scale(1)', 'scale(.7)');
  }

  createTooltipAnimation() {
    this.tooltipAnimation = createAnimation()
      .addElement(this.tooltip.nativeElement)
      .beforeAddClass('show')
      .delay(400)
      .duration(400)
      .easing('ease')
      .fromTo('opacity', 0, 1)
      .fromTo('transform', 'translate(-50%, -100%)', 'translate(-50%, -90%)');
  }

}
