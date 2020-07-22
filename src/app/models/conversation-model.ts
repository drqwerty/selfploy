import { Moment } from 'moment';
import { firestore } from 'firebase';
import { User } from './user-model';
import { LatLng } from 'leaflet';

export enum ConversationProperties {
  participants = 'participants',
  request      = 'request',
  messages     = 'messages',
  readed       = 'readed',
  senderUid    = 'senderUid',
  text         = 'text',
  timestamp    = 'timestamp',
  id           = 'id',
  isText       = 'isText',
  isImage      = 'isImage',
  isCoordinate = 'isCoordinate',
  url          = 'url',
  fromMe       = 'fromMe',
  anotherUser  = 'anotherUser',
  address      = 'address',
  coordinates  = 'coordinates',
}

export class Conversation {
  [ConversationProperties.id]          : string;
  [ConversationProperties.participants]: { [uid: string]: boolean };
  [ConversationProperties.request]     : string;
  [ConversationProperties.messages]    : { [id: string]: Message };
  [ConversationProperties.anotherUser] : User;
}

export class Message {
  [ConversationProperties.id]           : string;
  [ConversationProperties.fromMe]       : boolean;
  [ConversationProperties.readed]       : boolean;
  [ConversationProperties.senderUid]    : string;
  [ConversationProperties.text]         : string;
  [ConversationProperties.timestamp]    : firestore.Timestamp | Moment;
  [ConversationProperties.isText]       : boolean;
  [ConversationProperties.isImage]      : boolean;
  [ConversationProperties.isCoordinate] : boolean;
  [ConversationProperties.url]          : string;
  [ConversationProperties.address]      : string;
  [ConversationProperties.coordinates]  : firestore.GeoPoint | LatLng;
  
}