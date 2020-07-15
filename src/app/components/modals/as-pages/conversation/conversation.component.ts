import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ModalController, IonContent, IonGrid } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
})
export class ConversationComponent implements AfterViewChecked {


  messages: any = [
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594552754943, text: "aaa" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594553754949, text: "no puede ser" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594554754955, text: "estás ahi???" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594555754958, text: "siiiii" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594556754961, text: "sadfasdf" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594557754978, text: "sdfasdf asd fasd fsadfsad fsd fsd sd sadf df sda fsd f" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594558754988, text: " asdf asd fadsfs dfewsfs dfsfs fs fdadsa ffsafdadffdf d af asdf asdfsadfads fasd fasdf mkn" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626154943, text: "aaa" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594626254949, text: "no puede ser" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594626354955, text: "estás ahi???" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626454958, text: "siiiii" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626554961, text: "sadfasdf" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626654978, text: "sdfasdf asd fasd fsadfsad fsd fsd sd sadf df sda fsd f" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594626754988, text: " asdf asd fadsfs dfewsfs dfsfs fs fdadsa ffsafdadffdf d af asdf asdfsadfads fasd fasdf mkn" }
  ];



  @ViewChild(IonContent) ionContentO: IonContent;
  @ViewChild(IonContent, { read: ElementRef }) ionContent: ElementRef;
  @ViewChild(IonGrid, { read: ElementRef }) ionGrid: ElementRef;

  private nearToBottom = true;
  private touching = false;

  backgroundColor = 'primary'

  constructor(
    private modalController: ModalController
  ) {
    this.messages.forEach(message => {
      message.timestamp = moment(message.timestamp1);
    })
  }

  ionViewWillEnter() {
    this.setCornersStyle();
  }

  ngAfterViewChecked() {
    if (!this.touching && this.nearToBottom) {
      this.ionContentO.scrollToBottom();
    }
  }

  touchStart() {
    this.touching = true;
  }

  touchEnd() {
    this.hideTimestamp();
    this.touching = false;
  }

  goBack() {
    this.modalController.dismiss();
  }

  setCornersStyle() {
    setTimeout(() => {
      const shadowRoot = this.ionContent.nativeElement.shadowRoot;
      const background = shadowRoot.querySelector("#background-content") as HTMLElement;
      const content = shadowRoot.querySelector(".inner-scroll") as HTMLElement;

      background.style.backgroundColor = `var(--ion-color-${this.backgroundColor})`;
      content.style.borderRadius = '40px 40px 0 0';
    });
  }

  logScrolling({ scrollTop }) {
    const { clientHeight } = this.ionContent.nativeElement;
    const { scrollHeight } = this.ionGrid.nativeElement;
    const scrollBottom = clientHeight + scrollTop;
    this.nearToBottom = scrollBottom > scrollHeight - 5;
  }

  hideTimestamp() {
    this.ionGrid.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
  }

  onSameDay(index1: number, index2: number) {
    const date1 = <moment.Moment>this.messages[index1]?.timestamp;
    const date2 = <moment.Moment>this.messages[index2].timestamp;

    return date2.isSame(date1, 'day');
  }

}
