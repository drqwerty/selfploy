import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageMessages'
})
export class ImageMessagesPipe implements PipeTransform {

  transform(allMessages: any[]): any[] {
    return allMessages.filter(message => message.isImage);
  }

}
