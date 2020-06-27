import { NgModule } from '@angular/core';
import { DebounceClickDirective } from './debounce-click.directive';

@NgModule({
  declarations: [
    DebounceClickDirective,
  ],

  exports: [
    DebounceClickDirective,
  ]
})
export default class DebounceClickModule { }