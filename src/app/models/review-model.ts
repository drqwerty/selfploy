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


  constructor(review: any = null) {
    if (review) {
      const { id, professionalId, ownerId, text, stars, timestamp } = review;

      this.id             = id;
      this.professionalId = professionalId;
      this.ownerId        = ownerId;
      this.text           = text;
      this.stars          = stars;

      this.timestamp = moment(timestamp.toDate());
    }

  }
}