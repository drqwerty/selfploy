import { WorkingHours } from './user-model';
import { LatLng } from 'leaflet';
import { Moment } from 'moment';
import { firestore } from 'firebase';

export enum RequestStatus {
  draft,
  open,
  closed,
  completed,
  edit,
  delete,
}

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
  status = 'status',
  notifyAll = 'notifyAll',
  owner = 'owner',
  id = 'id',
  unreadMesseages = 'unreadMesseages',
}

export class Request {
  [RequestProperties.service]: string;
  [RequestProperties.category]: string;
  [RequestProperties.startDate]: Moment | firestore.Timestamp;
  [RequestProperties.endDate]: Moment | firestore.Timestamp;
  [RequestProperties.workingHours]: WorkingHours[];
  [RequestProperties.priority]: boolean;
  [RequestProperties.title]: string;
  [RequestProperties.description]: string;
  [RequestProperties.hasImages]: boolean;
  [RequestProperties.budget]: number;
  [RequestProperties.hideLocationAccuracy]: boolean;
  [RequestProperties.addressFull]: string;
  [RequestProperties.addressCity]: string;
  [RequestProperties.coordinates]: LatLng | firestore.GeoPoint;
  [RequestProperties.status]: RequestStatus;
  [RequestProperties.notifyAll]: boolean;
  [RequestProperties.owner]: string;
  [RequestProperties.id]: string;
  [RequestProperties.unreadMesseages]: boolean;

  constructor() {
    this.hideLocationAccuracy = false;
    this.hasImages = false;
    this.priority = false;
    this.notifyAll = false;
    this.status = RequestStatus.draft;
  }
}