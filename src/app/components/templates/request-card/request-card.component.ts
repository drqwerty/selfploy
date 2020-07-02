import { Component, OnInit, Input } from '@angular/core';
import { Request } from 'src/app/models/request-model';

@Component({
  selector: 'request-card',
  templateUrl: './request-card.component.html',
  styleUrls: ['./request-card.component.scss'],
})
export class RequestCardComponent implements OnInit {

  @Input() request: Request;


  constructor() { }

  ngOnInit() {
    console.log(this.request);
    
  }



}
