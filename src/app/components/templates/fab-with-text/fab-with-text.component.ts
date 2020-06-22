import { Component, Input, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'fab-with-text',
  templateUrl: './fab-with-text.component.html',
  styleUrls: ['./fab-with-text.component.scss'],
})
export class FabWithTextComponent implements AfterViewInit {

  @Input() vertical: 'top' | 'center' | 'bottom';
  @Input() horizontal: 'center' | 'start' | 'end';
  @Input() name: string;
  @Input() text: string;
  @Input() compactButton: boolean;


  @ViewChild('textWrapper') textWrapper: ElementRef;

  constructor(
    private renderer: Renderer2,
  ) { }

  ngAfterViewInit() {
    setTimeout(() => {
      const { width } = this.textWrapper.nativeElement.getBoundingClientRect();
      this.renderer.setStyle(this.textWrapper.nativeElement, 'width', `${width}px`);
    });
  }
}
