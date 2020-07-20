import { Pipe, PipeTransform } from '@angular/core';
import { Message } from '../models/conversation-model';

@Pipe({
  name: 'objectToArray',
  pure: false
})
export class ObjectToArrayPipe implements PipeTransform {

  transform(allMessages: { [id: string]: Message }): Message[] {
    if (!allMessages) return [];
    const messages = [];
    Object.values(allMessages).forEach(message => messages.push(message));
    return messages;
  }

}
