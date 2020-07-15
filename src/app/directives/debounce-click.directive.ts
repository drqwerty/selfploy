import { Directive, HostListener, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime as dt } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Directive({
  selector: '[debounceClick]'
})
export class DebounceClickDirective implements OnInit {

  @Input() debounceTime = 500
  
  @Output() debounceClick = new EventEmitter<MouseEvent>();


  private clicks = new Subject<MouseEvent>();

  constructor() { }

  @HostListener('click', ['$event'])
  clickEvent(event: MouseEvent) {
    this.clicks.next(event);
  }


  ngOnInit() {
    this.clicks
      .pipe(
        dt(this.debounceTime),
        untilDestroyed(this),
      )
      .subscribe(e => this.debounceClick.emit(e));
  }
}
