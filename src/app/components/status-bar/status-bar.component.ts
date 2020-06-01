import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
})
export class StatusBarComponent implements OnInit {

  @Input('color') color: string;

  constructor() { }

  ngOnInit(): void {
    if (!this.color?.startsWith('#'))
      this.color = getComputedStyle(document.documentElement).getPropertyValue(`--ion-color-${this.color}`);
  }
}
