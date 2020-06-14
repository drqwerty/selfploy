import { Component, Input } from '@angular/core';
import { Map as leafletMap, tileLayer, icon, circle, marker, LatLng, Circle } from 'leaflet';
import { environment } from "src/environments/environment";


@Component({
  selector: 'map-preview',
  templateUrl: './map-preview.component.html',
  styleUrls: ['./map-preview.component.scss'],
})
export class MapPreviewComponent {

  @Input() private coordinates: LatLng;
  @Input() private radiusKm: number;
  @Input() private hideMarker: boolean;


  private map: leafletMap;
  private circleRadius: Circle;

  constructor() { }

  initMap() {
    if (this.map) return;
    this.loadMap();
    this.createCircleRadius();
    this.createMarker();
  }

  private loadMap() {
    const urlApiMapbox = 'https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}';

    this.map = new leafletMap('map-preview', { zoomControl: false, attributionControl: false }).setView(this.coordinates, 9);
    tileLayer(urlApiMapbox, { accessToken: environment.mapboxConfig.apiKey, id: 'streets-v11' }).addTo(this.map);
  }

  private createCircleRadius() {
    if (!this.radiusKm) return;

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

  private createMarker() {
    if (this.hideMarker) return;

    marker(this.coordinates, {
      icon: icon({
        iconUrl: '../../../assets/marker-icon.svg',
        iconSize: [26, 40],
        iconAnchor: [13, 40],
      })
    }).addTo(this.map);
  }

}
