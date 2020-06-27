import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { Map as leafletMap, tileLayer, icon, circle, marker, LatLng, Circle, Marker, Control, control } from 'leaflet';
import { environment } from "src/environments/environment";
import { ModalController, Platform } from '@ionic/angular';
import { Plugins, StatusBarStyle, PermissionType, Capacitor } from '@capacitor/core';
import { Animation, createAnimation } from '@ionic/core';
import * as Geocoding from 'esri-leaflet-geocoder';
const { StatusBar, Geolocation, Permissions } = Plugins;

@Component({
  selector: 'app-map-full-screen',
  templateUrl: './map-full-screen.component.html',
  styleUrls: ['./map-full-screen.component.scss'],
})
export class MapFullScreenComponent {

  @Input() id: string;
  @Input() private coordinates: LatLng;
  @Input() private radiusKm: number;
  @Input() private hideMarker: boolean;

  @ViewChild('innerLocationCircle') animationElement: ElementRef;


  private map: leafletMap;
  private circleRadius: Circle;
  private marker: Marker;

  lc: Control.Locate;
  geocodeService: any;
  goToLocationOnFound = false;

  locationButtonAnimation: Animation;
  locationStatus: 'searching' | 'found' | undefined;
  skipEvents = false;
  myLocationColor: 'tertiary' | 'primary' = 'tertiary';

  constructor(
    private modalController: ModalController,
    private platform: Platform,
  ) { }

  ionViewWillEnter() {
    this.createMyLocationAnimation();
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Light });
  }
  
  ionViewDidEnter() {
    this.initMap();
  }
  
  ionViewDidLeave() {
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: StatusBarStyle.Dark });
    this.lc.stop();
  }

  goBack() {
    this.modalController.dismiss();
  }

  initMap() {
    this.loadMap();
    this.loadMapEvents();
    this.locate(false);
    this.createCircleRadius();
    this.createMarker();
  }

  private loadMap() {
    if (this.map) return;
    const urlApiMapbox = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    this.map = new leafletMap('map-full-screen', { zoomControl: false, attributionControl: false }).setView(this.coordinates, 9);
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

  private createCircleRadius() {
    if (!this.radiusKm) return;

    if (this.circleRadius) {
      this.circleRadius.setLatLng(this.coordinates).setRadius(this.radiusKm * 1000);

    } else {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary');
      this.circleRadius = circle(this.coordinates, {
        color,
        fillOpacity: 0.3,
        radius: this.radiusKm * 1000,
        stroke: false,
      });
      this.circleRadius.addTo(this.map);
    }

    if (this.radiusKm != 0) this.map.fitBounds(this.circleRadius.getBounds());
  }

  private createMarker() {
    if (!this.marker) {
      this.marker = marker(this.coordinates, {
        opacity: this.hideMarker ? 0 : 1,
        icon: icon({
          iconUrl: '../../../assets/marker-icon.svg',
          iconSize: [26, 40],
          iconAnchor: [13, 40],
        })
      }).addTo(this.map);

    } else {
      this.marker.setLatLng(this.coordinates);
      this.marker.setOpacity(this.hideMarker ? 0 : 1);
    }
  }

  loadMapEvents() {
    this.map.on('locationfound', () => {
      this.locationStatus = 'found';
      this.skipMapEvents();
      this.locationButtonAnimation.stop();
      this.setColorMyLocationButton('primary');
      if (this.goToLocationOnFound) setTimeout(() => this.lc.start());
    });

    this.map.on('zoomstart', () => this.setColorMyLocationButton('tertiary'));
    this.map.on('dragstart', () => this.setColorMyLocationButton('tertiary'));
  }

  async locate(requestPersmission = true) {
    if (requestPersmission) this.goToLocationOnFound = true;
    if (this.locationStatus === 'searching') return;

    const { state } = await Permissions.query({ name: PermissionType.Geolocation });
    switch (state) {
      case 'granted':
        // in android forces the location to be requested again if it had already been requested
        // without this, the second time a map is loaded it takes up to a minute to "find" the user's location
        if (this.platform.is('capacitor') && this.platform.is('android')) Geolocation.getCurrentPosition();
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

  createMyLocationAnimation() {
    this.locationButtonAnimation = createAnimation()
      .addElement(this.animationElement.nativeElement)
      .duration(1000)
      .easing('ease-out')
      .iterations(Infinity)
      .direction('alternate')
      .fromTo('transform', 'scale(1)', 'scale(.7)');
  }


}
