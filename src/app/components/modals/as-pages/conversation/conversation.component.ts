import { Component, ViewChild, ElementRef, AfterViewChecked, ViewChildren, QueryList, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalController, IonContent, IonGrid, IonImg } from '@ionic/angular';
import * as moment from 'moment';
import { FivGallery, FivGalleryImage } from '@fivethree/core';
import { takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { Message, Conversation } from 'src/app/models/conversation-model';
import { DataService } from 'src/app/providers/data.service';
import { User } from 'src/app/models/user-model';
import { CameraSourceActionSheetComponent } from 'src/app/components/action-sheets/camera-source-action-sheet/camera-source-action-sheet.component';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { MapLocationComponent } from '../map-location/map-location.component';
import { ModalAnimationSlideWithOpacityFromModalEnter, ModalAnimationSlideWithOpacityFromModalLeave } from 'src/app/animations/page-transitions';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { LatLng } from 'leaflet';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
const { StatusBar } = Plugins;

@UntilDestroy()
@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  animations: [
    trigger('button', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate(".25s ease", style({ transform: 'scale(1)', opacity: 1, })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate(".25s ease", style({ transform: 'scale(0)', opacity: 0, })),
      ])
    ])
  ]
})
export class ConversationComponent implements OnInit, AfterViewChecked, OnDestroy {

  @Input() requestId: string;
  @Input() partnerId: string;
  @Input() backgroundColor = 'primary';


  @ViewChild(IonContent)                       ionContentO     : IonContent;
  @ViewChild(IonContent, { read: ElementRef }) ionContent      : ElementRef;
  @ViewChild(IonGrid, { read: ElementRef })    ionGrid         : ElementRef;
  @ViewChildren(MapPreviewComponent)           mapPreviewList  : QueryList<MapPreviewComponent>;

  @ViewChild('bottomToolbar')                  bottomToolbar   : ElementRef;
  @ViewChild(FivGallery)                       fivGallery      : FivGallery;
  @ViewChildren(FivGalleryImage)               fivGalleryImage : QueryList<FivGalleryImage>;
  @ViewChildren(IonImg)                        ionImg          : QueryList<any>;

  statusBarStyle: StatusBarStyle;

  private nearToBottom = true;
  private touching     = false;

  image                      : HTMLImageElement = null;
  bottomIntersectionObserver : IntersectionObserver;

  myUid        : string;
  anotherUser  : User;
  conversation : Conversation;
  messages     : { [id: string]: Message };
  newMessage   = '';

  firstNotReadedMessageId : string;
  notReadedMessageText    : string;

  constructor(
    private modalController: ModalController,
    private data: DataService,
  ) { }


  ngOnInit() {
    this.getMessages();
    this.checkNotReadedMessages();
    this.setMessagesAsReaded();
    this.getAnotherUser();
  }


  ngAfterViewChecked() {
    this.scrollToBottom();
  }


  ngOnDestroy() {
  }


  ionViewWillEnter() {
    this.setCornersStyle();
    this.subscribeNewMessages();
  }


  ionViewDidEnter() {
    this.updateStatusBar();
    this.mapPreviewList.toArray().forEach(el => el.initMap());
    this.mapPreviewList
      .changes
      .pipe(untilDestroyed(this))
      .subscribe((list: QueryList<MapPreviewComponent>) => setTimeout(() => list.last?.initMap()));
  }


  ionViewWillLeave() {
    if (this.conversation?.id) DataService.conversationOpenedList.shift();
    if (Capacitor.isPluginAvailable('StatusBar')) StatusBar.setStyle({ style: this.statusBarStyle });
  }


  async updateStatusBar() {
    if (Capacitor.isPluginAvailable('StatusBar')) {
      this.statusBarStyle = (await StatusBar.getInfo()).style;
      StatusBar.setStyle({ style: StatusBarStyle.Dark });
    }
  }


  scrollToBottom() {
    if (!this.touching && this.nearToBottom) this.ionContentO.scrollToBottom();
  }


  subscribeNewMessages() {
    this.data.newMessageSubject
      .pipe(untilDestroyed(this))
      .subscribe(async conversationId => {

        if (!this.conversation) {
          await new Promise(resolve => {
            const a = setInterval(() => {
              if (this.conversation) {
                clearInterval(a);
                resolve();
              }
            }, 250)
          })
        }

        if (conversationId === this.conversation.id) {
          if (Object.values(this.messages).slice(-1)[0].isImage) {
            setTimeout(() => {
              this.fivGallery.updateImagesIndex();
              this.fivGallery.images.last.click
                .pipe(untilDestroyed(this))
                .subscribe(image => this.fivGallery.open(image)); 
            });
          }

          this.firstNotReadedMessageId = null;
          this.notReadedMessageText = null;
          this.setMessagesAsReaded();
        }
      });
  }


  getMessages() {
    this.conversation = this.data.getConversation(this.requestId, this.partnerId);
    this.messages = this.conversation?.messages;
    if (this.conversation?.id) DataService.conversationOpenedList.unshift(this.conversation.id);
  }


  async getAnotherUser() {
    this.anotherUser = this.conversation?.anotherUser;
    if (!this.anotherUser) this.anotherUser = await this.data.getUserProfile(this.partnerId);
  }


  async openMapToSendLocation() {
    const modal = await this.modalController.create({
      component: MapLocationComponent,
      enterAnimation: ModalAnimationSlideWithOpacityFromModalEnter,
      leaveAnimation: ModalAnimationSlideWithOpacityFromModalLeave,
      componentProps: {
        coordinates: undefined,
        showTooltip: false,
        showHideLocation: false,
        acceptButtonText: 'Enviar',
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) this.sendLocation(data.addressFull, data.coordinates)
    });

    modal.present();
  }


  async openImageSource() {
    const modal = await this.modalController.create({
      component: CameraSourceActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet',
      componentProps: {
        showRemoveButton: false,
      }
    })

    modal.onWillDismiss().then(({ data }) => {
      if (data?.image) this.sendPhoto(data.image);
    });

    modal.present();
  }


  async sendLocation(addressFull: string, coordinates: LatLng) {
    const promise = this.data.sendLocation(this.requestId, this.partnerId, this.conversation?.id, addressFull, coordinates)
    setTimeout(() => this.ionContentO.scrollToBottom(), 50);

    await promise;
    if (!this.conversation) this.getMessages();
  }


  async sendPhoto(image: string) {
    await this.data.sendImage(this.conversation?.id, image, this.requestId, this.anotherUser.id);
    setTimeout(() => this.ionContentO.scrollToBottom(), 50);

    if (!this.conversation) this.getMessages();
  }


  async sendText() {
    const message = this.newMessage;
    this.newMessage = '';
    const promise = this.data.sendText(this.requestId, this.partnerId, this.conversation?.id, message);
    setTimeout(() => this.ionContentO.scrollToBottom(), 50);

    await promise;
    if (!this.conversation) this.getMessages();
  }


  /* conversation view */

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
    const date1 = <moment.Moment>Object.values(this.messages)[index1]?.timestamp;
    const date2 = <moment.Moment>Object.values(this.messages)[index2].timestamp;

    return date1?.isSame(date2, 'day');
  }


  formatDate(date: moment.Moment, format: 'LL' | 'HH:mm') {
    return date.format(format);
  }


  checkNotReadedMessages() {
    this.updateNotReadedMessagesText();
    this.findFirstNotReadedMessageId();
  }


  setMessagesAsReaded() {
    this.data.setMessagesAsReaded(this.conversation.id);
  }


  findFirstNotReadedMessageId() {
    const messageList = Object.values(this.messages);

    for (let i = 0; i < messageList.length; i++) {
      const messagePrev    = messageList[i-1];
      const messageCurrent = messageList[i];
  
      if (!messageCurrent.readed && !messageCurrent.fromMe
        && (
          messagePrev == null
          || messagePrev.fromMe
          || messagePrev.readed
        )) this.firstNotReadedMessageId = messageCurrent.id;

        if (this.firstNotReadedMessageId) break;
    }
  }


  updateNotReadedMessagesText() {
    const notReadedMessagesCount = Object.values(this.messages).filter(({ fromMe, readed }) => !fromMe && !readed).length;

    this.notReadedMessageText = notReadedMessagesCount == 1
      ? `${notReadedMessagesCount} mensaje nuevo`
      : `${notReadedMessagesCount} mensajes nuevos`
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
