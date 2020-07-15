import { Component, Input } from '@angular/core';

@Component({
  selector: 'empty-content',
  templateUrl: './empty-content.component.html',
  styleUrls: ['./empty-content.component.scss'],
})
export class EmptyContentComponent {

  @Input() text: string;
  _image: string;
  @Input()
  set image(val: string) { this._image = `/assets/background-drawings/${val}.svg` }
  get image(): string { return this._image }


  imageLoaded = false;

  constructor() { }


  notifyImageLoaded() {
    this.imageLoaded = true;
  }
}
