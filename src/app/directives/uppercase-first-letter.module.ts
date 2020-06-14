import { NgModule } from '@angular/core';
import { UpperCaseFirstLetterDirective } from './uppercase-first-letter.directive';

@NgModule({
  declarations: [
    UpperCaseFirstLetterDirective,
  ],

  exports: [
    UpperCaseFirstLetterDirective,
  ]
})
export default class UpperCaseFirstLetterModule { }