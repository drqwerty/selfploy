import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[upperCaseFirstLetter]'
})
export class UpperCaseFirstLetterDirective implements OnChanges {

  @Input() upperCaseFirstLetter: string;

  constructor(private el: ElementRef) { }

  ngOnChanges() {
    this.updateContent();
  }

  updateContent() {
    if (this.upperCaseFirstLetter?.length) {

      const firstChar = this.upperCaseFirstLetter.charAt(0);
      if (firstChar == firstChar.toUpperCase()) {
        this.el.nativeElement.textContent = this.upperCaseFirstLetter;
        return;
      }

      const arr: string[] = this.upperCaseFirstLetter.split('');
      arr[0] = arr[0].toUpperCase();
      this.el.nativeElement.textContent = arr.join('');
    }
  }

}
