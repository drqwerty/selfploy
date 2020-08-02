import { firestore } from 'firebase';
import * as moment from 'moment';
import { Moment } from 'moment';

export enum ReviewProperties {
  id             = 'id',
  professionalId = 'professionalId',
  ownerId        = 'ownerId',
  text           = 'text',
  stars          = 'stars',
  timestamp      = 'timestamp',
}

export class Review {
  [ReviewProperties.id]             : string;
  [ReviewProperties.professionalId] : string;
  [ReviewProperties.ownerId]        : string;
  [ReviewProperties.text]           : string;
  [ReviewProperties.stars]          : number;
  [ReviewProperties.timestamp]      : Moment | firestore.Timestamp;


  constructor({ id, professionalId, ownerId, text, stars, timestamp }: Review) {
    this.id             = id;
    this.professionalId = professionalId;
    this.ownerId        = ownerId;
    this.text           = text;
    this.stars          = stars;

    this.timestamp = timestamp?.constructor.name == 't'
      ? moment(timestamp.toDate())
      : moment(timestamp);
  }
}