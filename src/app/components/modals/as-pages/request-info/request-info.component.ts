import { Component, OnInit, Input, AfterViewInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular';
import { Request } from 'src/app/models/request-model';
import { MapPreviewComponent } from 'src/app/components/templates/map-preview/map-preview.component';
import { SuperTabs, SuperTab } from '@ionic-super-tabs/angular';
import { DataService } from 'src/app/providers/data.service';

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

  lastTabIndex = 0;
  propagateScrollEvent = true;

  backgroundColor = 'tertiary';

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

}
