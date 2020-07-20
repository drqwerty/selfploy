import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageMessages'
})
export class ImageMessagesPipe implements PipeTransform {

  transform(allMessages: any[]): any[] {

    // Object.filter = (obj, predicate) =>
    //   Object.keys(obj)
    //     .filter(key => predicate(obj[key]))
    //     .reduce((res, key) => (res[key] = obj[key], res), {});

    return allMessages.filter(message => message.isImage);
  }

}
