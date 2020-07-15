import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnChanges {

  @Input('color') color: string;

  constructor() { }


  ngOnChanges(): void {
    if (!this.color?.startsWith('#'))
      this.color = getComputedStyle(document.documentElement).getPropertyValue(`--ion-color-${this.color}`);
  }
}
