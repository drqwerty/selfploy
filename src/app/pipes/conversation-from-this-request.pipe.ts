import { Pipe, PipeTransform } from '@angular/core';
import { Conversation } from '../models/conversation-model';

@Pipe({
  name: 'conversationFromThisRequest',
  pure: false,
})
export class ConversationFromThisRequestPipe implements PipeTransform {

  transform(conversations: Conversation[], requestId: string) {
    return conversations.findIndex(conversation => conversation.request == requestId) > -1 ? true : false;
  }

}
