import { Component, ViewChild, ElementRef, AfterViewChecked, ViewChildren, QueryList } from '@angular/core';
import { ModalController, IonContent, IonGrid, IonImg } from '@ionic/angular';
import * as moment from 'moment';
import { FivGallery, FivGalleryImage } from '@fivethree/core';
import { takeUntil } from 'rxjs/operators';

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
    { fromMe: true, isImage: true, timestamp1: 1594626154945, url: "https://firebasestorage.googleapis.com/v0/b/tfg-selfploy.appspot.com/o/requests%2FkKGZcjO3CNuM4e5FnlEp%2FkKGZcjO3CNuM4e5FnlEp-1594031085.jpg?alt=media&token=461520f7-34ca-40ce-a69c-1f5e13d7f67b" },
    { fromMe: true, isImage: true, timestamp1: 1594626154946, url: "https://firebasestorage.googleapis.com/v0/b/tfg-selfploy.appspot.com/o/requests%2F1bqlv6A4zXmEu5el8Ymd%2F1bqlv6A4zXmEu5el8Ymd-1594030816.jpg?alt=media&token=02217d1f-3c77-44bc-ba9d-d3f5c8daa54e" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594626254949, text: "no puede ser" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594626354955, text: "estás ahi???" },
    { fromMe: false, isImage: true, timestamp1: 1594626154946, url: "https://firebasestorage.googleapis.com/v0/b/tfg-selfploy.appspot.com/o/requests%2FGrwtwj1UzZ66NXYC0adY%2FGrwtwj1UzZ66NXYC0adY-1594030945.jpg?alt=media&token=770fa807-c799-4432-900d-5694ab6dd177" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626454958, text: "siiiii" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626554961, text: "sadfasdf" },
    { fromMe: true, hasPendingWrites: false, timestamp1: 1594626654978, text: "sdfasdf asd fasd fsadfsad fsd fsd sd sadf df sda fsd f" },
    { fromMe: false, hasPendingWrites: false, timestamp1: 1594626754988, text: " asdf asd fadsfs dfewsfs dfsfs fs fdadsa ffsafdadffdf d af asdf asdfsadfads fasd fasdf mkn" }
  ];



  @ViewChild(IonContent) ionContentO: IonContent;
  @ViewChild(IonContent, { read: ElementRef }) ionContent: ElementRef;
  @ViewChild(IonGrid, { read: ElementRef }) ionGrid: ElementRef;

  @ViewChild('bottomToolbar') bottomToolbar: ElementRef;
  @ViewChild(FivGallery) fivGallery: FivGallery;
  @ViewChildren(FivGalleryImage) fivGalleryImage: QueryList<FivGalleryImage>;
  @ViewChildren(IonImg) ionImg: QueryList<any>;
  
  image: HTMLImageElement = null;
  bottomIntersectionObserver: IntersectionObserver;

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


  /* gallery */

  didOpen() {
    this.setBackGroundColor();

    // bug with ionic 5 or angular 9! default config fires click event twice
    this.fivGallery.swiper.nativeElement.swiper.off('click');
    let timerId;
    this.fivGallery.swiper.nativeElement.swiper.on('click', () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        if (this.fivGallery.controlsVisible) this.fivGallery.hideControls();
        else this.fivGallery.showControls();
      }, 300);
    });

    let scrollLeft;

    this.toggleImageVisibility(true)
    this.footerImgScroll();

    this.fivGallery.slides.ionSlideDidChange
      .pipe(takeUntil(this.fivGallery.$onDestroy))
      .subscribe(() => this.footerImgScroll(true));

    this.bottomIntersectionObserver = new IntersectionObserver(() => {
      if (scrollLeft != null) this.bottomToolbar.nativeElement.scrollTo(scrollLeft, 0);
    }, { threshold: 0 });
    this.bottomIntersectionObserver.observe(this.bottomToolbar.nativeElement);

    this.bottomToolbar.nativeElement.addEventListener('scroll', () => scrollLeft = this.bottomToolbar.nativeElement.scrollLeft);
  }


  setBackGroundColor(color = '#000000') {
    this.fivGallery.backdropColor = color;
    this.fivGallery.updateBackdrop = () => null;
  }


  footerImgScroll(smooth = false) {
    this.ionImg.toArray()[this.fivGallery.activeIndex].el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }


  willClose() {
    this.updateInitialImage();
    this.fivGallery.calculateImagePosition();
    this.toggleImageVisibility(false);
    this.bottomIntersectionObserver.disconnect();
  }


  toggleImageVisibility(visible: boolean, delay = 0) {
    if (delay)
      setTimeout(() => {
        this.image = this.fivGallery.initialImage.thumbnail.nativeElement;
        this.image.style.visibility = visible ? 'visible' : 'hidden';
      }, delay);
    else
      this.image.style.visibility = visible ? 'visible' : 'hidden';
  }


  goTo(index) {
    this.fivGallery.slides.slideTo(index);
  }


  updateInitialImage() {
    if (this.fivGallery.activeIndex == this.fivGalleryImage.toArray().length)
      this.fivGallery.activeIndex--;

    this.fivGallery.initialImage = this.fivGalleryImage.toArray()[this.fivGallery.activeIndex];
    this.image = this.fivGallery.initialImage.thumbnail.nativeElement;
  }

}
