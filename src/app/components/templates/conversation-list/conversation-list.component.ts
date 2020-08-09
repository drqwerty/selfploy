import { Component, OnInit, Input } from '@angular/core';
import { Conversation, Message } from 'src/app/models/conversation-model';
import { DataService } from 'src/app/providers/data.service';
import { Request } from 'src/app/models/request-model';
import { ModalController } from '@ionic/angular';
import { ConversationComponent } from '../../modals/as-pages/conversation/conversation.component';
import { ModalAnimationSlideWithOpacityFromModalEnter, ModalAnimationSlideWithOpacityFromModalLeave } from 'src/app/animations/page-transitions';
import { Moment } from 'moment';
import * as moment from 'moment';

@Component({
  selector: 'conversation-list',
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss'],
})
export class ConversationListComponent implements OnInit {


  @Input() currentRequest: Request;


  conversations: { [id: string]: Conversation };

  constructor(
    private data: DataService,
    private modalController: ModalController,
  ) { }


  ngOnInit() {
    this.conversations = this.data.conversations;
  }


  getLastMessage(messages: { [id: string]: Message }) {
    const lastMessage = Object.values(messages).sort((a, b) => (<Moment>a.timestamp).isAfter(b.timestamp) ? -1 : 1)[0];

    if (lastMessage.isText)       return lastMessage.text;
    if (lastMessage.isImage)      return '📷 Foto';
    if (lastMessage.isCoordinate) return '📍 ' + lastMessage.address;
  }


  getLastTimestamp(messages: { [id: string]: Message }) {
    const { timestamp } = Object.values(messages).sort((a, b) => (<Moment>a.timestamp).isAfter(b.timestamp) ? -1 : 1)[0];

    const today        = moment(moment().format('L'), 'DD/MM/YYYY');
    const timestampDay = moment((<Moment>timestamp).format('L'), 'DD/MM/YYYY');

    return today.isSame(timestampDay, 'day')
      ? (<Moment>timestamp).format('LT')
      : today.diff(timestampDay, 'days') == 1
        ? 'Ayer'
        : (<Moment>timestamp).format('L');
  }


  existMessagesNotReaded(messages: { [id: string]: Message }) {
    return Object.values(messages).some(({ fromMe, readed }) => !fromMe && !readed);
  }
  
  
  getNotReadedMessagesCount(messages: { [id: string]: Message }) {
    return Object.values(messages).filter(({ fromMe, readed }) => !fromMe && !readed).length;
  }


  async openConversation(conversation: Conversation) {
    const modal = await this.modalController.create({
      component: ConversationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityFromModalEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityFromModalLeave,
      componentProps: {
        requestId: conversation.request,
        partnerId: conversation.anotherUser.id,
        backgroundColor: 'secondary',
      },
    });

    modal.onWillDismiss().then(() => modal.classList.remove('background-black'));
    modal.present().then(() => modal.classList.add('background-black'));
  }


}
