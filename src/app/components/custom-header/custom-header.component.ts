import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'custom-header',
  templateUrl: './custom-header.component.html',
  styleUrls: ['./custom-header.component.scss'],
})
export class CustomHeaderComponent {

  @Input() protected title: string;


  @ViewChild('titleWrapper') private titleWrapper: ElementRef;
  @ViewChild('titleHeader') private titleHeader: ElementRef;

  private fontSizeDefault = 16.5;
  private heightDefault = 56;
  private deviceWidth: number;

  constructor(
    private platform: Platform,
  ) {
    this.deviceWidth = platform.width();
  }

  updateHeaderTitle(scrollValue: number) {
    const titleWidth = this.titleHeader.nativeElement.getBoundingClientRect().width;
    const elStyle = this.titleWrapper.nativeElement.style;

    if (scrollValue <= this.heightDefault) {
      const translateY = this.heightDefault - scrollValue;
      const fontSize   = translateY * 12 / this.heightDefault + this.fontSizeDefault;
      const width      = (this.deviceWidth - 40 - titleWidth) * translateY / this.heightDefault + titleWidth;

      elStyle.transform = `translateY(${translateY}px)`;
      elStyle.fontSize  = `${fontSize}px`;
      elStyle.width     = `${width}px`;
    } else {
      elStyle.transform = 'translateY(0)';
      elStyle.fontSize  = `${this.fontSizeDefault}px`;
      elStyle.width     = `${titleWidth}px`;
    }
  }
}
