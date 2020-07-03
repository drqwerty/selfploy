import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { DataService } from 'src/app/providers/data.service';
import { UserRole } from 'src/app/models/user-model';
import { Request } from 'src/app/models/request-model';
import { SuperTab, SuperTabs, SuperTabsToolbar } from '@ionic-super-tabs/angular';
import { IonContent } from '@ionic/angular';
const { StatusBar } = Plugins;
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.page.html',
  styleUrls: ['./request-list.page.scss'],
})
export class RequestListPage {

  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(SuperTabs) superTabs: SuperTabs;
  @ViewChild(SuperTabsToolbar, { read: ElementRef }) superTabsToolbar: ElementRef;
  @ViewChildren(SuperTab) superTabListQuery: QueryList<SuperTab>;

  superTabsToolbarStyle: CSSStyleDeclaration;
  statusBarColor = '#fff';

  superTabList: SuperTab[];
  lastTabIndex = 0;

  propagateScrollEvent = true;

  myUserId: string;
  imAClient: boolean;
  requestList: Request[];
  myRequestList: Request[];
  followingRequestList: Request[];

  constructor(
    private data: DataService,
  ) {
    data.requestsChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(() => this.updateRequestLists());
  }

  ionViewWillEnter() {
    this.initView();
  }

  ionViewDidEnter() {
    this.superTabsToolbarStyle = this.superTabsToolbar?.nativeElement.style;
    this.updateBackgroundColor(this.lastTabIndex);
  }

  async initView() {
    this.storeUserId();
    this.updateRequestLists();
    this.imAClient = await this.userIsClient();
    if (Capacitor.isPluginAvailable('StatusBar')) {
      const style = this.imAClient ? StatusBarStyle.Light : StatusBarStyle.Dark;
      StatusBar.setStyle({ style });
    }
  }

  async updateRequestLists() {
    const storedRequests = await this.data.getRequests();
    if (storedRequests !== this.requestList) {
      this.requestList = storedRequests;
      this.myRequestList = [];
      this.followingRequestList = [];
      this.requestList.forEach(request => {
        if (request.owner === this.myUserId) this.myRequestList.push(request);
        else this.followingRequestList.push(request);
      })
    }
  }

  async storeUserId() {
    this.myUserId = (await this.data.getMyProfile()).id;
  }

  async userIsClient() {
    return (await this.data.getMyProfile()).role === UserRole.client;
  }

  options() {

  }

  propagateScroll(e) {
    if (this.propagateScrollEvent) this.ionContent.scrollToPoint(0, e.detail.scrollTop);
  }

  async scrollLastTabToTop({ detail }) {
    const { index } = detail;

    if (this.lastTabIndex != index) {
      this.propagateScrollEvent = false;
      this.updateBackgroundColor(index);
      (await this.superTabListQuery.toArray()[1 - index].getRootScrollableEl()).scrollTo(0, 0);
      this.ionContent.scrollToTop(350);
      this.lastTabIndex = index;
      this.propagateScrollEvent = true;
    }
  }

  goToTab(index) {
    this.superTabs.selectTab(index);
  }

  updateBackgroundColor(index) {
    if (this.imAClient) return;

    if (!Capacitor.isPluginAvailable('StatusBar')) {
      this.statusBarColor = 'white';

    } else {
      if (index) {
        this.superTabsToolbarStyle.setProperty('--st-indicator-color', 'var(--ion-color-secondary)');
        this.statusBarColor = 'secondary';
      } else {
        this.superTabsToolbarStyle.removeProperty('--st-indicator-color');
        this.statusBarColor = 'primary';
      }
    }
  }
}
