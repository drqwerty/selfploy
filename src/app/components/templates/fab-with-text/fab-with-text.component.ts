import { Component, Input, ViewChild, ElementRef, Renderer2, AfterViewInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fab-with-text',
  templateUrl: './fab-with-text.component.html',
  styleUrls: ['./fab-with-text.component.scss'],
})
export class FabWithTextComponent implements AfterViewInit {

  @Input() iconName: string;
  @Input() text: string;
  @Input() collapsed: boolean;
  @Input() color = 'primary';

  @Output() clicked = new EventEmitter<void>();


  @ViewChild('fabWrapper') fabWrapper: ElementRef;
  @ViewChild('left') left: ElementRef;
  @ViewChild('textWrapper') textWrapper: ElementRef;
  @ViewChild('center') center: ElementRef;
  @ViewChild('textContent') textContent: ElementRef;

  loaded = false;

  constructor(
    private renderer: Renderer2,
  ) { }

  ngAfterViewInit() {
    this.setStyles();
  }

  setStyles() {
    document.documentElement.style.setProperty('--custom-fab-background-color', `var(--ion-color-${this.color})`);

    setTimeout(() => {
      const { width } = this.fabWrapper.nativeElement.getBoundingClientRect();

      const elementsToStyle = [
        { el: this.fabWrapper.nativeElement,  style: 'background-color', string: 'transparent' },
        { el: this.fabWrapper.nativeElement,  style: 'width',            string: `${width}px` },
        { el: this.textContent.nativeElement, style: 'position',         string: 'absolute' },
        { el: this.center.nativeElement,      style: 'transform',        string: `scaleX(${width - 53})` },
        { el: this.left.nativeElement,        style: 'transform',        string: `translateX(-${width - 57}px)` },
        { el: this.textWrapper.nativeElement, style: 'transform',        string: `translateX(-${width - 57}px)` },
      ]

      elementsToStyle.forEach(({ el, style, string }) => this.renderer.setStyle(el, style, string));

      setTimeout(() => this.loaded = true, 100);
    });
  }

  onClick() {
    this.clicked.emit();
  }
}
