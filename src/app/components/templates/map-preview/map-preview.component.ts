import { Component, Input } from '@angular/core';
import { Map as leafletMap, tileLayer, icon, circle, marker, LatLng, Circle, Marker } from 'leaflet';
import { environment } from "src/environments/environment";
import { ModalController } from '@ionic/angular';
import { MapFullScreenComponent } from '../../modals/as-pages/map-full-screen/map-full-screen.component';


@Component({
  selector: 'map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.scss'],
})
export class MapPreviewComponent {

  @Input() id: string;
  @Input() private coordinates: LatLng;
  @Input() private radiusKm: number;
  @Input() private hideMarker: boolean;


  idPrefix = 'map-preview-';
  private map: leafletMap;
  private circleRadius: Circle;
  private marker: Marker;

  constructor(
    private modalController: ModalController,
  ) { }

  initMap() {
    this.loadMap();
    this.disableInteraction();
    this.createCircleRadius();
    this.createMarker();
  }

  private loadMap() {
    if (this.map) return;
    const urlApiMapbox = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    this.map = new leafletMap(this.idPrefix + this.id, { zoomControl: false, attributionControl: false }).setView(this.coordinates, 9);
    tileLayer(urlApiMapbox, { accessToken: environment.mapboxConfig.apiKey, id: 'streets-v11' }).addTo(this.map);
  }

  private disableInteraction() {
    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();
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

  async openFullScreenMap() {
    (await this.modalController.create({
      component: MapFullScreenComponent,
      componentProps: {
        coordinates: this.coordinates,
        radiusKm: this.radiusKm,
        hideMarker: this.hideMarker,
      }
    })).present();
  }

}
