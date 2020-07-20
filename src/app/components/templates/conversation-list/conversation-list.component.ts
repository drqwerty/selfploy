import { Component, OnInit, Input } from '@angular/core';
import { Conversation, Message } from 'src/app/models/conversation-model';
import { DataService } from 'src/app/providers/data.service';
import { Request } from 'src/app/models/request-model';
import { Moment } from 'moment';
import { ModalController } from '@ionic/angular';
import { ConversationComponent } from '../../modals/as-pages/conversation/conversation.component';
import { ModalAnimationSlideWithOpacityFromModalEnter, ModalAnimationSlideWithOpacityFromModalLeave } from 'src/app/animations/page-transitions';
import { last } from 'lodash';

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
    return lastMessage.isImage
      ? '📷 Foto'
      : lastMessage.text;
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

    await modal.present();
  }


}
