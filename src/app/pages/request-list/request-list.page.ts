import { Component, ViewChild, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Plugins, StatusBarStyle, Capacitor } from '@capacitor/core';
import { DataService } from 'src/app/providers/data.service';
import { UserRole, UserConfig } from 'src/app/models/user-model';
import { Request, RequestListConfig, RequestStatus } from 'src/app/models/request-model';
import { SuperTab, SuperTabs, SuperTabsToolbar } from '@ionic-super-tabs/angular';
import { IonContent, PopoverController } from '@ionic/angular';
const { StatusBar } = Plugins;
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RequestListPopoverComponent } from 'src/app/components/popovers/request-list-popover/request-list-popover.component';
import * as moment from 'moment';

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
  userConfig: UserConfig;
  requestStatus = RequestStatus

  constructor(
    private data: DataService,
    private popoverController: PopoverController
  ) {
    data.requestsChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(() => this.updateRequestLists());
    data.userConfigChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(newConfig => {
        this.userConfig = newConfig;
        this.applyFilters();
      });
  }

  ionViewWillEnter() {
    this.initView();
  }

  ionViewDidEnter() {
    this.superTabsToolbarStyle = this.superTabsToolbar?.nativeElement.style;
    this.updateBackgroundColor(this.lastTabIndex);
    this.presentPopover(null);
  }

  async initView() {
    this.storeUserId();
    await this.getUserConfig();
    this.updateRequestLists();
    this.imAClient = await this.userIsClient();
    if (Capacitor.isPluginAvailable('StatusBar')) {
      const style = this.imAClient ? StatusBarStyle.Light : StatusBarStyle.Dark;
      StatusBar.setStyle({ style });
    }
  }

  showCard(state: RequestStatus) {
    if (state != this.requestStatus.draft && state != this.requestStatus.completed) return true;
    if (state == this.requestStatus.draft && this.userConfig.requestListOptions.showDraft) return true;
    if (state == this.requestStatus.completed && this.userConfig.requestListOptions.showCompleted) return true;

    return false;
  }

  async updateRequestLists() {
    const storedRequests = await this.data.getRequestList();
    if (storedRequests !== this.requestList) {
      this.requestList = storedRequests;
      const tempMyRequestList = [];
      const tempFollowingRequestList = [];
      this.requestList.forEach(request => {
        if (request.owner === this.myUserId) tempMyRequestList.push(request);
        else tempFollowingRequestList.push(request);
      });
      this.myRequestList = tempMyRequestList;
      this.followingRequestList = tempFollowingRequestList;
    }
    this.applyFilters();
  }

  applyFilters() {
    this.myRequestList.sort((a, b) => {

      if (a.status === RequestStatus.draft && b.status !== RequestStatus.draft) return -1;
      if (a.status !== RequestStatus.draft && b.status === RequestStatus.draft) return 1;
      if (a.status === RequestStatus.completed && b.status !== RequestStatus.completed) return 1;
      if (a.status !== RequestStatus.completed && b.status === RequestStatus.completed) return -1;

      let order = 0;

      if (this.userConfig.requestListOptions.orderBy === RequestListConfig.orderByState) {
        order = (a.status === b.status)
          ? this.compareDates(a, b)
          : this.userConfig.requestListOptions.order === RequestListConfig.ascendingOrder
            ? this.compareStates(a.status, b.status)
            : this.compareStates(b.status, a.status);
      }

      if (this.userConfig.requestListOptions.orderBy === RequestListConfig.orderByDate) {
        order = (!this.compareDates(a, b))
          ? this.compareStates(a.status, b.status)
          : this.userConfig.requestListOptions.order === RequestListConfig.ascendingOrder
            ? this.compareDates(a, b)
            : this.compareDates(b, a);
      }

      if (!order) order = this.compareServices(a, b);
      if (!order) order = this.compareTitles(a.title, b.title);

      return order;
    });
  }

  private compareStates(a: RequestStatus, b: RequestStatus) {
    return b - a;
  }

  private compareDates(a: Request, b: Request) {
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;

    if (!a.startDate && !b.startDate) return 0
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;

    if (a.startDate.isBefore(b.startDate)) return -1;
    if (a.startDate.isAfter(b.startDate)) return 1;
    if (a.startDate.isSame(b.startDate)) return 0;
  }

  private compareServices(a, b) {
    let order = 0;
    if (a.category && !b.category) return -1;
    if (!a.category && b.category) return 1;
    if (a.category && b.category) order = a.category.localeCompare(b.category);

    if (!order) {
      if (!a.service && !b.service) return 0;
      order = a.service.localeCompare(b.service);
    }

    return order;
  }

  private compareTitles(a, b) {
    if (a && !b) return -1;
    if (!a && b) return 1;
    if (a && b) return a.localeCompare(b);
    return 0;
  }

  async storeUserId() {
    this.myUserId = (await this.data.getMyProfile()).id;
  }

  async getUserConfig() {
    this.userConfig = await this.data.getUserConfig();
  }

  async userIsClient() {
    return (await this.data.getMyProfile()).role === UserRole.client;
  }

  async presentPopover(ev: any) {
    const popover = await this.popoverController.create({
      component: RequestListPopoverComponent,
      event: ev,
    });

    popover.present();
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
