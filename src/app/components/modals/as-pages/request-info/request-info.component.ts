import { Component, OnInit, Input, AfterViewInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Request, RequestStatus, RequestStatusText } from 'src/app/models/request-model';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { SuperTabs, SuperTab } from '@ionic-super-tabs/angular';
import { DataService } from 'src/app/providers/data.service';
import { RequestCardActionSheetComponent } from 'src/app/components/action-sheets/request-card-action-sheet/request-card-action-sheet.component';
import { ActionSheetEnter, ActionSheetLeave } from 'src/app/animations/action-sheet-transition';
import { DeleteConfirmActionSheetComponent } from 'src/app/components/action-sheets/delete-confirm-action-sheet/delete-confirm-action-sheet.component';
import { RequestNewComponent } from '../request-new/request-new.component';

@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  styleUrls: ['./request-info.component.scss'],
})
export class RequestInfoComponent implements OnInit, AfterViewInit {

  @Input() request: Request;


  @ViewChild(MapPreviewComponent) mapPreview: MapPreviewComponent;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  @ViewChildren(SuperTab) superTabListQuery: QueryList<SuperTab>;

  requestStatus = RequestStatus;
  statusText = RequestStatusText
  lastTabIndex = 0;
  propagateScrollEvent = true;

  backgroundColor = 'tertiary';
  collapsedFab = false;

  hideShadow = true;
  conversations = [];
  ownerName: string;

  constructor(
    private data: DataService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.data.getUserProfile(this.request.owner).then(user => this.ownerName = user.name);
  }

  ngAfterViewInit() {
    this.setCornersStyle();
  }

  ionViewDidEnter() {
    if (this.request.coordinates) this.mapPreview.initMap();
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

  openChat() {

  }

  scrollEvent({ deltaY, scrollTop }) {
    this.hideShadow = !scrollTop;
    if (deltaY) this.collapsedFab = 0 < deltaY;
  }

  propagateScroll(e) {
    if (this.propagateScrollEvent) this.ionContent.scrollToPoint(0, e.detail.scrollTop);
  }

  async scrollLastTabToTop({ detail }) {
    const { index } = detail;

    if (this.lastTabIndex != index) {
      this.propagateScrollEvent = false;
      (await this.superTabListQuery.toArray()[1 - index].getRootScrollableEl()).scrollTo(0, 0);
      this.ionContent.scrollToTop(350);
      this.lastTabIndex = index;
      this.propagateScrollEvent = true;
    }
  }

  goToTab(index) {
    this.superTabs.selectTab(index);
  }

  async presentOptions(event: MouseEvent) {
    event.stopPropagation();
    const modal = await this.modalController.create({
      component: RequestCardActionSheetComponent,
      enterAnimation: ActionSheetEnter,
      leaveAnimation: ActionSheetLeave,
      cssClass: 'action-sheet border-top-radius',
      componentProps: {
        status: this.request.status,
        isMine: this.request.isMine,
      }
    });

    modal.onWillDismiss().then(({ data }) => {
      if (data) {

        switch (data) {
          case RequestStatus.closed:
            this.closeRequest();
            break;

          case RequestStatus.completed:
            this.completeRequest();
            break;

          case RequestStatus.edit:
            this.editRequest();
            break;

          case RequestStatus.delete:
            this.deleteRequest();
            break;

          default:
            break;
        }

      }
    })

    modal.present();
  }

  async closeRequest() {
    (await this.showConfirmAction('Continuar'))
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) this.data.closeRequest(this.request);
      });
  }

  async completeRequest() {
    (await this.showConfirmAction('Continuar'))
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) this.data.completeRequest(this.request);
      });
  }

  async editRequest() {
    const modal = await this.modalController.create({
      component: RequestNewComponent,
      componentProps: {
        edit: true,
        request: this.request,
        images: this.request.images,
      }
    });

    modal.onWillDismiss().then(() => modal.classList.remove('background-black'));
    modal.present().then(() => modal.classList.add('background-black'));
  }

  async deleteRequest() {
    (await this.showConfirmAction())
      .onDidDismiss().then(({ data: confirm }) => {
        if (confirm) {
          this.data.removeRequest(this.request);
          this.modalController.dismiss();
        }
      });
  }

  async showConfirmAction(confirmText?: string) {
    let componentProps = confirmText ? { text: confirmText } : {};
    const modal = await this.modalController.create({
      component: DeleteConfirmActionSheetComponent,
      cssClass: 'modal',
      componentProps,
    });
    modal.present();
    return modal;
  }

}
