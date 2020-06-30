import { WorkingHours } from './user-model';
import { LatLng } from 'leaflet';

export enum RequestProperties {
  service = 'service',
  category = 'category',
  startDate = 'startDate',
  endDate = 'endDate',
  workingHours = 'workingHours',
  priority = 'priority',
  title = 'title',
  description = 'description',
  hasImages = 'hasImages',
  budget = 'budget',
  hideLocationAccuracy = 'hideLocationAccuracy',
  addressFull = 'addressFull',
  addressCity = 'addressCity',
  coordinates = 'coordinates',
}

export class Request {
  [RequestProperties.service]: string;
  [RequestProperties.category]: string;
  [RequestProperties.startDate]: Date;
  [RequestProperties.endDate]: Date;
  [RequestProperties.workingHours]: WorkingHours[];
  [RequestProperties.priority]: boolean;
  [RequestProperties.title]: string;
  [RequestProperties.description]: string;
  [RequestProperties.hasImages]: boolean;
  [RequestProperties.budget]: number;
  [RequestProperties.hideLocationAccuracy]: boolean;
  [RequestProperties.addressFull]: string;
  [RequestProperties.addressCity]: string;
  [RequestProperties.coordinates]: LatLng;
}