import { Moment } from 'moment';
import { firestore } from 'firebase';
import { User } from './user-model';

export enum ConversationProperties {
  participants = 'participants',
  request      = 'request',
  messages     = 'messages',
  readed       = 'readed',
  senderUid    = 'senderUid',
  text         = 'text',
  timestamp    = 'timestamp',
  id           = 'id',
  isImage      = 'isImage',
  url          = 'url',
  fromMe       = 'fromMe',
  anotherUser  = 'anotherUser'
}

export class Conversation {
  [ConversationProperties.id]          : string;
  [ConversationProperties.participants]: { [uid: string]: boolean };
  [ConversationProperties.request]     : string;
  [ConversationProperties.messages]    : { [id: string]: Message };
  [ConversationProperties.anotherUser] : User;
}

export class Message {
  [ConversationProperties.id]       : string;
  [ConversationProperties.fromMe]   : boolean;
  [ConversationProperties.readed]   : boolean;
  [ConversationProperties.senderUid]: string;
  [ConversationProperties.text]     : string;
  [ConversationProperties.timestamp]: firestore.Timestamp | Moment;
  [ConversationProperties.isImage]  : boolean;
  [ConversationProperties.url]      : string;
}