import { Directive, ElementRef, AfterContentInit } from '@angular/core';

@Directive({
  selector: '[upperCaseFirstLetter]'
})
export class UpperCaseFirstLetterDirective implements AfterContentInit {

  constructor(private el: ElementRef) { }

  ngAfterContentInit() {
    if (this.el.nativeElement?.textContent !== '') {
      const arr: string[] = this.el.nativeElement.textContent.split('');
      arr[0] = arr[0].toUpperCase();
      this.el.nativeElement.textContent = arr.join('');
    }
  }

}
