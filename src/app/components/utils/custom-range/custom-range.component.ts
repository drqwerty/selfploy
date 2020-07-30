import { Component, Input, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { IonRange } from '@ionic/angular';

@Component({
  selector: 'custom-range',
  templateUrl: './custom-range.component.html',
  styleUrls: ['./custom-range.component.scss'],
})
export class CustomRangeComponent {

  @Input() min = 1;
  @Input() max = 30;
  @Input() value = 0;
  @Input() pinPinned = false;

  @Output() valueChange = new EventEmitter<number>();


  @ViewChild(IonRange) ionRange: IonRange;
  @ViewChild(IonRange, { read: ElementRef }) ionRangeEl: ElementRef;

  constructor() { }


  emitValue() {
    this.valueChange.emit(this.value);
  }


  setPinText() {
    const rangeSlider = this.ionRangeEl.nativeElement.shadowRoot.querySelector('.range-slider') as HTMLElement;
    const rangeSliderRect = rangeSlider.getBoundingClientRect();
    const rangePing = this.ionRangeEl.nativeElement.shadowRoot.querySelector('.range-pin') as HTMLElement;
    rangePing.style.whiteSpace = 'nowrap';

    if (this.pinPinned) rangePing.style.transform = "none";

    const getValue = (ev) => {
      if (ev == null) return null;
      const clamp = (min, n, max) => Math.max(min, Math.min(n, max));
      const ratioToValue = (ratio, min, max) => clamp(min, Math.round((max - min) * ratio) + min, max);
      const ratio = clamp(0, (ev.x - rangeSliderRect.left) / rangeSliderRect.width, 1);
      return ratioToValue(ratio, this.min, this.max);
    }
    const setContent = (ev?) => rangePing.textContent = (getValue(ev) ?? this.value) + ' km';
    setContent();

    rangeSlider.addEventListener('pointerdown', ev => setContent(ev));
    rangeSlider.addEventListener('pointermove', ev => setContent(ev));
  }


  setValue(value: number) {
    this.ionRange.value = value;
    (this.ionRangeEl.nativeElement.shadowRoot.querySelector('.range-pin') as HTMLElement).textContent = value + ' km';
  }

}
