import { WorkingHours } from './user-model';
import { LatLng } from 'leaflet';
import * as moment from 'moment';
import { firestore } from 'firebase';

export enum RequestListConfig {
  hide,
  show,
  ascendingOrder,
  descendingOrder,
  orderByDate,
  orderByState,
}

export enum RequestStatus {
  draft,
  open,
  closed,
  completed,
  edit,
  delete,
}

export const RequestStatusText = [
  'borrador',
  'publicado',
  'cerrado',
  'completado',
  'editar',
  'eliminar',
]

export enum RequestProperties {
  service              = 'service',
  category             = 'category',
  startDate            = 'startDate',
  endDate              = 'endDate',
  workingHours         = 'workingHours',
  priority             = 'priority',
  title                = 'title',
  description          = 'description',
  hasImages            = 'hasImages',
  images               = 'images',
  budget               = 'budget',
  hideLocationAccuracy = 'hideLocationAccuracy',
  addressFull          = 'addressFull',
  addressCity          = 'addressCity',
  coordinates          = 'coordinates',
  status               = 'status',
  notifyAll            = 'notifyAll',
  owner                = 'owner',
  id                   = 'id',
  unreadMesseages      = 'unreadMesseages',
  lastEditAt           = 'lastEditAt',
  isMine               = 'isMine',
  contactsTotalNumber  = 'contactsTotalNumber',
  completedBy          = 'completedBy',
}

export class Request {
  [RequestProperties.service]              : string;
  [RequestProperties.category]             : string;
  [RequestProperties.startDate]            : any; /* Moment | firestore.Timestamp */
  [RequestProperties.endDate]              : any; /* Moment | firestore.Timestamp */
  [RequestProperties.workingHours]         : WorkingHours[];
  [RequestProperties.priority]             : boolean;
  [RequestProperties.title]                : string;
  [RequestProperties.description]          : string;
  [RequestProperties.hasImages]            : boolean;
  [RequestProperties.images]               : { name: string, url: string }[];
  [RequestProperties.budget]               : number;
  [RequestProperties.hideLocationAccuracy] : boolean;
  [RequestProperties.addressFull]          : string;
  [RequestProperties.addressCity]          : string;
  [RequestProperties.coordinates]          : LatLng | firestore.GeoPoint;
  [RequestProperties.status]               : RequestStatus;
  [RequestProperties.notifyAll]            : boolean;
  [RequestProperties.owner]                : string;
  [RequestProperties.id]                   : string;
  [RequestProperties.unreadMesseages]      : boolean;
  [RequestProperties.lastEditAt]           : firestore.Timestamp;
  [RequestProperties.isMine]               : boolean;
  [RequestProperties.contactsTotalNumber]  : number = 0;
  [RequestProperties.completedBy]          : string;

  constructor(request?: Request) {
    if (request) {
      Object.keys(request).forEach(key => this[key] = request[key]);

      if (!this.images) this.images = [];

      if (this.coordinates && !(this.coordinates instanceof LatLng)) {
        const lat = (<firestore.GeoPoint>this.coordinates).latitude;
        const lng = (<firestore.GeoPoint>this.coordinates).longitude;
        if (lat && lng) this.coordinates = new LatLng(lat, lng);
      }

      if (this.startDate) this.startDate = moment(this.startDate.toDate());
      if (this.endDate)   this.endDate   = moment(this.endDate.toDate());

    } else {
      this.hideLocationAccuracy = false;
      this.hasImages = false;
      this.priority = false;
      this.notifyAll = false;
      this.status = RequestStatus.draft;
      this.images = [];
    }
  }

  static copy(from: Request, to: Request) {
    Object.keys(to).forEach(key => to[key] = null);
    Object.keys(from).forEach(key => to[key] = from[key]);
  }
}