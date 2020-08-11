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
  statusBarAvailable = false;

  superTabList: SuperTab[];
  lastTabIndex = 0;

  propagateScrollEvent = true;

  myUserId: string;
  imAClient: boolean;
  myRequestList: Request[];
  followingRequestList: Request[];
  userConfig: UserConfig;
  requestStatus = RequestStatus

  constructor(
    private data: DataService,
    private popoverController: PopoverController,
  ) {
    this.statusBarAvailable = Capacitor.isPluginAvailable('StatusBar');
    data.myRequestListChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(() => this.updateMyRequestList());
    data.followingRequestListChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(() => this.updateFollowingRequestList());
    data.userConfigChangedSubject
      .pipe(untilDestroyed(this))
      .subscribe(newConfig => {
        this.userConfig = newConfig;
        this.applyFilters();
      });
    // data.resetRequestStates();
  }


  ionViewWillEnter() {
    this.initView();
  }


  ionViewDidEnter() {
    this.superTabsToolbarStyle = this.superTabsToolbar?.nativeElement.style;
    this.updateBackgroundColor(this.lastTabIndex);
    // this.presentPopover(null);
  }


  async initView() {
    this.storeUserId();
    await this.getUserConfig();
    this.updateMyRequestList();
    this.updateFollowingRequestList();
    this.imAClient = await this.userIsClient();
    if (this.statusBarAvailable) {
      const style = this.imAClient ? StatusBarStyle.Light : StatusBarStyle.Dark;
      StatusBar.setStyle({ style });
    }
  }


  showAtLeastOneRequest() {
    return this.myRequestList?.some(({ status }) => this.showCard(status));
  }


  showAtLeastOneFollowingRequest() {
    return this.followingRequestList?.some(({ status }) => this.showCard(status));
  }


  showCard(state: RequestStatus) {
    if (state != this.requestStatus.draft     && state != this.requestStatus.completed)            return true;
    if (state == this.requestStatus.draft     && this.userConfig.requestListOptions.showDraft)     return true;
    if (state == this.requestStatus.completed && this.userConfig.requestListOptions.showCompleted) return true;

    return false;
  }


  async updateMyRequestList() {
    const storedRequestList = await this.data.getMyRequestList();
    if (storedRequestList !== this.myRequestList) {
      this.myRequestList = storedRequestList;
      this.applyFilters();
    }
  }


  async updateFollowingRequestList() {
    const storedRequestList = await this.data.getRequestFollowingList();
    if (storedRequestList !== this.followingRequestList) {
      this.followingRequestList = storedRequestList;
      this.applyFilters();
    }
  }


  applyFilters() {
    this.myRequestList?.sort(this.sortFunction);
    this.followingRequestList?.sort(this.sortFunction);
  }


  private sortFunction = (a: Request, b: Request) => {
    if (a.status === RequestStatus.draft     && b.status !== RequestStatus.draft)     return -1;
    if (a.status !== RequestStatus.draft     && b.status === RequestStatus.draft)     return 1;
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
    if (a.startDate.isAfter(b.startDate))  return 1;
    if (a.startDate.isSame(b.startDate))   return 0;
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


  async presentPopover(event: MouseEvent) {
    const popover = await this.popoverController.create({
      component: RequestListPopoverComponent,
      event,
      componentProps: { userConfig: this.userConfig, }
    });

    popover.present();
  }


  propagateScroll({ scrollTop }) {
    if (this.propagateScrollEvent) this.ionContent.scrollToPoint(0, scrollTop);
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


  async updateBackgroundColor(index) {
    if (this.imAClient == null) this.imAClient = await this.userIsClient();

    this.statusBarColor = this.statusBarAvailable
      ? this.imAClient
        ? '#fff'
        : index
          ? 'secondary'
          : 'primary'
      : '#fff';

    if (!this.imAClient) {
      if (index) {
        this.superTabsToolbarStyle.setProperty('--st-indicator-color', 'var(--ion-color-secondary)');
      } else {
        this.superTabsToolbarStyle.removeProperty('--st-indicator-color');
      }
    }
  }
}
