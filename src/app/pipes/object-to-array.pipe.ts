import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectToArray',
  pure: false
})
export class ObjectToArrayPipe implements PipeTransform {

  transform(object: any) {
    if (!object) return [];
    const values = [];
    Object.values(object).forEach(value => values.push(value));
    return values;
  }

}
