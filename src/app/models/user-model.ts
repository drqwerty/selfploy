import { LatLng } from 'leaflet';
import { firestore } from 'firebase';
import { RequestListConfig } from './request-model';

export interface UserConfig {
  requestListOptions: {
    showCompleted : RequestListConfig.show | RequestListConfig.hide,
    showDraft     : RequestListConfig.show | RequestListConfig.hide,
    orderBy       : RequestListConfig.orderByDate | RequestListConfig.orderByState,
    order         : RequestListConfig.ascendingOrder | RequestListConfig.descendingOrder,
  }
}

export enum UserRole {
  client,
  professional,
}

export enum WorkingHours {
  morning   = 'mañana',
  afternoon = 'tarde',
  evening   = 'noche',
  flexible  = 'flexible'
}

export enum UserProperties {
  email                        = 'email',
  role                         = 'role',
  profilePic                   = 'profilePic',
  name                         = 'name',
  name_splited                 = 'name_splited',
  token                        = 'token',
  hasProfilePic                = 'hasProfilePic',
  profileCompleted             = 'profileCompleted',
  companyName                  = 'companyName',
  about                        = 'about',
  services                     = 'services',
  workingHours                 = 'workingHours',
  hideLocationAccuracy         = 'hideLocationAccuracy',
  addressFull                  = 'addressFull',
  addressCity                  = 'addressCity',
  coordinates                  = 'coordinates',
  radiusKm                     = 'radiusKm',
  professionalProfileActivated = 'professionalProfileActivated',
  hasFavorites                 = 'hasFavorites',
  requests                     = 'requests',
  requestsFollowing            = 'requestsFollowing',
  lastEditAt                   = 'lastEditAt',
  id                           = 'id',
  distance                     = 'distance',
  isFav                        = 'isFav',
  fcmToken                     = 'fcmToken',
  selectedForRequest           = 'selectedForRequest',
}

export class User {
  [UserProperties.email]                        : string;
  [UserProperties.role]                         : UserRole;
  [UserProperties.profilePic]                   : string;
  [UserProperties.name]                         : string;
  [UserProperties.name_splited]                 : string[];
  [UserProperties.token]                        : string;
  [UserProperties.hasProfilePic]                : boolean;
  [UserProperties.profileCompleted]             : boolean;
  [UserProperties.companyName]                  : string;
  [UserProperties.about]                        : string;
  [UserProperties.services]                     : any;
  [UserProperties.workingHours]                 : WorkingHours[];
  [UserProperties.hideLocationAccuracy]         : boolean;
  [UserProperties.addressFull]                  : string;
  [UserProperties.addressCity]                  : string;
  [UserProperties.coordinates]                  : LatLng;
  [UserProperties.radiusKm]                     : number;
  [UserProperties.professionalProfileActivated] : boolean;
  [UserProperties.hasFavorites]                 : boolean;
  [UserProperties.requests]                     : { [id: string]: string };
  [UserProperties.requestsFollowing]            : { [id: string]: string };
  [UserProperties.lastEditAt]                   : firestore.Timestamp;
  [UserProperties.id]                           : string;
  [UserProperties.distance]                     : number;
  [UserProperties.isFav]                        : boolean;
  [UserProperties.fcmToken]                     : string;
  [UserProperties.selectedForRequest]           : boolean;
}