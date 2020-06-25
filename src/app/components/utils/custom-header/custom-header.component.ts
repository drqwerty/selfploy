import { Component, ViewChild, ElementRef, Input, ViewContainerRef, AfterViewInit } from '@angular/core';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'custom-header',
  templateUrl: './custom-header.component.html',
  styleUrls: ['./custom-header.component.scss'],
})
export class CustomHeaderComponent implements AfterViewInit {

  private readonly constant = 100 / 56;


  @Input() title: string;
  @Input() color = 'tertiary';


  @ViewChild("text", { static: false }) private text: ElementRef;
  @ViewChild("yAxis", { static: false }) private yAxis: ElementRef;
  @ViewChild("xAxis", { static: false }) private xAxis: ElementRef;

  private textStyle: CSSStyleDeclaration;
  private yAxisSyle: CSSStyleDeclaration;
  private xAxisSyle: CSSStyleDeclaration;

  private isScrollingTimeout: NodeJS.Timeout;
  private touchingContent = false;
  private scroll = 0;

  constructor(private _view: ViewContainerRef) { }

  ngAfterViewInit() {
    this.init(this._view.element.nativeElement.nextElementSibling);
  }

  private async init(ionContent: IonContent) {
    this.initVariables();
    this.moveTitle(0);

    const scrollEl = await ionContent.getScrollElement();
    this.addSpace(ionContent, scrollEl);
    this.addListeners(ionContent, scrollEl);
  }

  private initVariables() {
    this.textStyle = this.text.nativeElement.style;
    this.yAxisSyle = this.yAxis.nativeElement.style;
    this.xAxisSyle = this.xAxis.nativeElement.style;
  }

  private addSpace(ionContent: IonContent, scrollEl: HTMLElement) {
    const { height } = scrollEl.getBoundingClientRect();
    const content = (<any>ionContent).querySelector('.nav-bar-space') as HTMLElement;

    let contentHeight: number;
    if (content) contentHeight = content.getBoundingClientRect().height + 56;

    if (contentHeight && contentHeight > height && contentHeight < height + 56)
      scrollEl.append(document.createElement('ion-toolbar'));
    scrollEl.prepend(document.createElement('ion-toolbar'));
  }

  private addListeners(ionContent: IonContent, scrollEl: HTMLElement) {
    ionContent.scrollEvents = true;
    scrollEl.addEventListener('scroll', () => {
      this.moveTitle(scrollEl.scrollTop);
      this.onScrollStop(() => this.moveContent(ionContent));
    });
    scrollEl.addEventListener('touchend', () => {
      this.touchingContent = false;
      this.onScrollStop(() => this.moveContent(ionContent));
    });
    scrollEl.addEventListener('touchstart', () => this.touchingContent = true);
  }

  private onScrollStop(callBack) {
    clearTimeout(this.isScrollingTimeout);
    this.isScrollingTimeout = setTimeout(() => callBack(), 250);
  }

  private moveContent(ionContent: IonContent) {
    if (this.touchingContent) return;
    if (this.scroll < 56) {
      if (this.scroll < 28) ionContent.scrollToTop(250);
      else ionContent.scrollToPoint(0, 56, 250);
    }
  }

  private moveTitle(scroll: number) {
    this.scroll = scroll;
    const value = 56 - Math.min(scroll, 56);
    const translateX = (56 - value) / 2 * this.constant;
    const translateY = value;
    const translateXText = (value - 56) / 2 * this.constant;
    const scaleText = value / 84 + 1;
    this.textStyle.whiteSpace = scroll > 28 ? 'nowrap' : 'pre-line';
    this.textStyle.transform = `translateX(${translateXText}%) scale(${scaleText})`;
    this.xAxisSyle.transform = `translateX(${translateX}%)`;
    this.yAxisSyle.transform = `translateY(${translateY}px)`;
  }

}
