import { Pipe, PipeTransform } from '@angular/core';
import { Conversation } from '../models/conversation-model';

@Pipe({
  name: 'filterByRequestId',
  pure: false,
})
export class FilterByRequestIdPipe implements PipeTransform {

  transform(conversations: Conversation[], requestId: string) {
    return conversations.filter(conversation => conversation.request == requestId);
  }

}
