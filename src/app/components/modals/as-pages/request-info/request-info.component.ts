import { Component, OnInit, Input, AfterViewInit, ViewChild } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Request } from 'src/app/models/request-model';

@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  styleUrls: ['./request-info.component.scss'],
})
export class RequestInfoComponent implements AfterViewInit {

  @Input() request: Request;


  @ViewChild(IonContent) ionContent: IonContent;

  backgroundColor = 'tertiary';

  constructor(
    private modalController: ModalController,
  ) { }

  ngAfterViewInit() {
    this.setCornersStyle();
  }

  setCornersStyle() {
    setTimeout(() => {
      const shadowRoot = (this.ionContent as any).el.shadowRoot;
      const background = shadowRoot.querySelector("#background-content") as HTMLElement;
      const content = shadowRoot.querySelector(".inner-scroll") as HTMLElement;

      background.style.backgroundColor = `var(--ion-color-${this.backgroundColor})`;
      content.style.borderRadius = '40px 40px 0 0';
    });
  }

  close() {
    this.modalController.dismiss();
  }

}
