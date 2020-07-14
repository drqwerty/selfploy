import { Injectable } from '@angular/core';
import { User, UserConfig, UserProperties } from 'src/app/models/user-model';
import { TabBarState } from 'src/app/animations/tab-bar-transition'
import { StorageService } from 'src/app/services/storage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import Utils from 'src/app/utils';
import { Subject, Observable, Subscription } from 'rxjs';
import { Request, RequestStatus } from 'src/app/models/request-model';
import { map, takeWhile, filter, retry, takeUntil } from 'rxjs/operators';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import * as moment from 'moment';
import { NotificationService } from '../services/notification.service';
import * as diff from 'changeset';
import { dbKeys } from '../models/db-keys';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  static tabBarState: TabBarState;

  public userLogout = new Subject<void>();

  public user: User;
  public favorites: User[];
  public myRequestList: Request[];
  public followingRequestList: Request[];
  private followingRequestsSubscription: { [id: string]: Subscription } = {};
  public favoritesChangedSubject = new Subject<void>();
  public myRequestListChangedSubject = new Subject<void>();
  public followingRequestListChangedSubject = new Subject<void>();
  public userConfigChangedSubject = new Subject<UserConfig>();
  public userConfig: UserConfig;

  constructor(
    private storage: StorageService,
    private fStorage: FirebaseStorage,
    private firestore: FirestoreService,
    private notifications: NotificationService,
  ) { }


  /* user */

  async createMyProfile(uid: string, user: User) {
    user = await this.firestore.createUserProfile(uid, user);
    await this.storage.saveUserProfile(user);
  }

  getUserProfile(uid: string): Promise<User> {
    return this.firestore.getUserProfile(uid);
  }

  async getMyProfile(uid?: string): Promise<User> {
    if (!this.user) {
      this.user = await this.storage.getUserProfile();

      if (this.user) {
        this.syncProfile();
      } else {
        this.user = await this.firestore.getUserProfile(uid);
        await this.storage.saveUserProfile(this.user);
      }
    }
    return this.user;
  }

  private syncProfile() {
    this.firestore.getUserProfile(this.user.id).then(userF => {

      const { seconds: s1, nanoseconds: n1 } = this.user.lastEditAt;
      const { seconds: s2, nanoseconds: n2 } = userF.lastEditAt;

      if (s1 != s2 || n1 != n2) {
        this.user = userF;
        this.storage.saveUserProfile(this.user);
      }
    });
  }

  saveUserProfile(user: User) {
    return this.storage.saveUserProfile(user);
  }

  removeUserProfile() {
    this.user = null;
    this.favorites = null;
    this.myRequestList = null;
    this.followingRequestList = null;
    this.followingRequestsSubscription = {};
    this.userConfig = null;
    this.storage.removeUserProfile();
  }

  async updatedMyProfile(user: User) {
    user = await this.firestore.updateUserProfile(user);
    this.storage.saveUserProfile(user);
  }

  async updateUserLocationAccuracySetting(hideLocationAccuracy: boolean) {
    (await this.getMyProfile()).hideLocationAccuracy = hideLocationAccuracy;
    this.user = await this.firestore.updateUserLocationAccuracySetting(hideLocationAccuracy);
    this.storage.saveUserProfile(this.user);
  }

  private async updateUserHasFavoritesProperty(hasFavorites: boolean) {
    if ((await this.getMyProfile()).hasFavorites !== hasFavorites) {
      this.user.hasFavorites = hasFavorites;
      this.user = await this.firestore.updateUserHasFavoritesProperty(hasFavorites);
      this.storage.saveUserProfile(this.user);
    }
  }

  private async updateUserRequestFollowingList(list: {}) {
    (await this.getMyProfile()).requestsFollowing = list;
    this.storage.saveUserProfile(this.user);
  }

  getUserProfilePic(uid: string) {
    return this.fStorage.getUserProfilePic(uid);
  }


  /* professionals */

  async findProfessionalOf(categoryName: string, serviceName: string) {
    return this.firestore.findProfessionalOf(categoryName, serviceName, (await this.getMyProfile()).coordinates);
  }

  async findUserByName(userName: string, categoryFilter: string) {
    return this.firestore.findUserByName(userName, categoryFilter);
  }


  /* favorites */

  async saveFavorite(user: User) {
    this.favorites = (await Promise.all([
      this.storage.saveFavorite(await this.getFavoriteList(), user),
      this.firestore.saveFavorite(user.id),
    ]))[0];
    this.updateUserHasFavoritesProperty(!!this.favorites.length)
    this.favoritesChangedSubject.next();
  }

  async removeFavorite(user: User) {
    this.favorites = (await Promise.all([
      this.storage.removeFavorite(await this.getFavoriteList(), user),
      this.firestore.removeFavorite(user.id),
    ]))[0];
    this.updateUserHasFavoritesProperty(!!this.favorites.length)
    this.favoritesChangedSubject.next();
  }

  async getFavoriteList(): Promise<User[]> {
    if (!(await this.getMyProfile()).hasFavorites) return [];

    if (!this.favorites) {
      this.favorites = await this.storage.getFavorites();

      if (this.favorites) {
        this.syncFavorites();

      } else {
        this.favorites = await this.firestore.getFavorites();
        await this.storage.saveFavorites(this.favorites);
        await this.translateCoors();
      }

    } else {
      this.syncFavorites();
    }

    return this.favorites;
  }

  private async syncFavorites() {
    let sync = false;
    const favoritesF = await this.firestore.getFavorites();

    if (this.favorites.length != favoritesF.length) {
      this.favorites = favoritesF;
      sync = true;

    } else {
      favoritesF.forEach(favoriteF => {
        const index = this.favorites.findIndex(favorite => favorite.id == favoriteF.id);

        if (index > -1) {
          const { seconds: s1, nanoseconds: n1 } = this.favorites[index].lastEditAt;
          const { seconds: s2, nanoseconds: n2 } = favoriteF.lastEditAt;

          if (s1 != s2 || n1 != n2) {
            this.favorites[index] = favoriteF;
            sync = true;
          }
        }
      });
    }

    if (sync) this.storage.saveFavorites(this.favorites);
    this.translateCoors();
  }


  /* requests */

  private async getRequestList(
    list: Request[],
    requestList: UserProperties.requests | UserProperties.requestsFollowing,
    dbKey: dbKeys.requests | dbKeys.requestsFollowing
  ): Promise<Request[]> {

    list = (await this.storage.getData(dbKey))?.map(request => {
      if (request.startDate) request.startDate = moment(request.startDate);
      if (request.endDate) request.endDate = moment(request.endDate);
      return request;
    });

    if (!list) {
      list = await this.firestore.getRequestList((await this.getMyProfile())[requestList]);
      await this.storage.saveRequests(list, dbKey);
    }

    return list;
  }

  async getMyRequestList(): Promise<Request[]> {
    if (!(await this.getMyProfile()).requests) return [];

    if (!this.myRequestList)
      this.myRequestList = await this.getRequestList(this.myRequestList, UserProperties.requests, dbKeys.requests);

    return this.myRequestList;
  }

  async getRequestFollowingList(): Promise<Request[]> {
    if (!(await this.getMyProfile()).requestsFollowing) return [];

    if (!this.followingRequestList)
      this.followingRequestList = await this.getRequestList(this.followingRequestList, UserProperties.requestsFollowing, dbKeys.requestsFollowing);

    return this.followingRequestList;
  }

  async saveRequest(request: Request) {
    let requestData: {
      id: string;
      path: string;
      requestSaved: Request;
    };

    if (request.id) {
      requestData = await this.firestore.saveRequest(request);
      // el observador la guarda en local
      // await this.storage.saveRequest(await this.getRequestList(), request);

    } else {
      requestData = await this.firestore.saveRequest(request);
      const { path, requestSaved } = requestData;
      request = new Request(requestSaved);
      this.myRequestList = await this.storage.saveRequest(await this.getMyRequestList(), request);
      this.observeMyRequest(this.firestore.getObservableFromPath(path));
      await this.updateRequestList(requestSaved.id, path, false, true);
    }
    return requestData;
  }

  async updateLocalRequest(request: Request) {
    if (request.isMine) {
      this.myRequestList = await this.storage.updateRequest(await this.getMyRequestList(), request);
      this.myRequestListChangedSubject.next();

    } else {
      this.followingRequestList = await this.storage.updateRequest(await this.getRequestFollowingList(), request);
      this.followingRequestListChangedSubject.next();
    }
  }

  async removeRequest(request: Request) {
    if (request.isMine) {
      this.myRequestList = await this.storage.removeRequest(await this.getMyRequestList(), request);
    } else {
      this.followingRequestList = await this.storage.removeRequest(await this.getRequestFollowingList(), request);
    }
    this.firestore.removeRequest(request);
    this.updateRequestList(request.id, null, true, request.isMine);
  }

  private async updateRequestList(id, path, remove, isMine) {
    const user = await this.getMyProfile();
    const list = isMine
      ? UserProperties.requests
      : UserProperties.requestsFollowing;

    if (remove) {
      delete user[list][id];
    } else {
      if (!user[list]) user[list] = {};
      user[list][id] = path;
    }

    await this.saveUserProfile(this.user);

    if (isMine) this.myRequestListChangedSubject.next();
    else this.followingRequestListChangedSubject.next();
  }

  async observeMyRequests() {
    const { requests } = await this.getMyProfile();
    if (!requests) return;
    const obsevableList = this.firestore.getMyRequestsAsObservableList(requests);

    obsevableList.forEach(observable => this.observeMyRequest(observable));
  }

  async observeFollowingRequests() {

    console.log('observando');

    const { requestsFollowing } = await this.getMyProfile();

    Object.keys(requestsFollowing).forEach(id => this.observeFollowingRequest(id, requestsFollowing[id]));

    (await this.firestore.getFollowingRequestListObservable())
      .pipe(takeUntil(this.userLogout))
      .subscribe((requestsFollowingList) => {

        const listDiff = <{ type: "put" | "del", key: string[], value?: string }[]>diff(requestsFollowing, requestsFollowingList);

        console.log(listDiff);

        if (listDiff.length) {
          listDiff.forEach(el => {
            if (el.type === 'put') {
              requestsFollowing[el.key[0]] = el.value;
              this.observeFollowingRequest(el.key[0], el.value);

            } else if (el.type === 'del') {
              delete requestsFollowing[el.key[0]];
              this.unobserveFollowingRequest(el.key[0]);
            }
          });
          this.updateUserRequestFollowingList(requestsFollowing);
        }
        console.log(this.followingRequestsSubscription)

      });
  }

  private observeMyRequest(observable: Observable<Action<DocumentSnapshot<any>>>) {
    this.observeRequest(observable, true);
  }

  private observeFollowingRequest(id: string, path: string) {
    this.followingRequestsSubscription[id] = this.observeRequest(this.firestore.getObservableFromPath(path), false)
    console.log('mete', id);
  }

  private observeRequest(observable: Observable<Action<DocumentSnapshot<any>>>, isMine: boolean) {
    return observable
      .pipe(
        map(({ payload }) => {
          const id = payload.id;
          const data = <Request>(payload.data())?.d;
          return { id, isMine, ...data };
        }),
        filter(request => !!request.lastEditAt),
        takeWhile(request => request?.status != RequestStatus.completed, true),
      )
      .subscribe(async requestChanged => {
        const requestList = isMine ? await this.getMyRequestList() : await this.getRequestFollowingList();
        const localRequest = requestList.find(request => request.id == requestChanged.id);
        if (!localRequest || localRequest.lastEditAt.seconds != requestChanged.lastEditAt.seconds) {
          const requestUpdated = new Request(requestChanged);
          if (requestUpdated.hasImages) requestUpdated.images = await this.fStorage.getRequestImages(requestUpdated.id);

          this.updateLocalRequest(requestUpdated);
        }
      });
  }

  private unobserveFollowingRequest(id: string) {
    this.followingRequestsSubscription[id].unsubscribe();
    delete this.followingRequestsSubscription[id];
    console.log('sale', id);
  }

  closeRequest(request: Request) {
    request.status = RequestStatus.closed;
    this.saveRequest(request);
  }

  completeRequest(request: Request) {
    request.status = RequestStatus.completed;
    this.saveRequest(request);
  }

  resetRequestStates() {
    this.firestore.setAllRequestToDraftState();
  }


  /* notifications */

  async saveFCMToken() {
    let resolve: (value: string) => void;
    let reject: () => void;
    const registerFCM = new Promise((_resolve: (value: string) => void, _reject: () => void) => {
      resolve = _resolve;
      reject = _reject;
    });

    registerFCM
      .then(async fcmToken => {
        const user = await this.getMyProfile();
        if (user.fcmToken != fcmToken) await this.firestore.saveFCMToken(fcmToken);
      })
      .catch(() => { });

    this.notifications.register(resolve, reject);
  }

  async sendRequestNotifications(requestData: { id: string; path: string; requestSaved: Request; }) {
    const { category, service, coordinates } = requestData.requestSaved;
    const { name: ownersName } = await this.getMyProfile();
    const professionalList = await this.firestore.findProfessionalOf(category, service, coordinates);

    console.log(professionalList);

    const filteredProfessionalList = professionalList
      .filter(user => user.fcmToken)
      .filter(user => user.distance <= user.radiusKm);

    const fcmTokenList = filteredProfessionalList
      .map(professional => professional.fcmToken);

    const professionalIdList = filteredProfessionalList
      .map(professional => professional.id);

    this.firestore.addRequestToFollowingUsersList(professionalIdList, { id: requestData.id, path: requestData.path });

    console.log(fcmTokenList);

    // this.sendNotifications(
    //   'Nuevo trabajo disponible',
    //   `${ownersName} necesita un servicio de ${requestData.requestSaved.service}`,
    //   fcmTokenList
    // );


  }

  async sendNotifications(title, body, fcmTokenList) {
    if (fcmTokenList.length) this.notifications.send(title, body, fcmTokenList);
  }


  /* user config */

  async getUserConfig() {
    this.userConfig =
      await this.storage.getUserConfig()
      ?? await this.storage.createUserConfig();
    return this.userConfig;
  }

  async updateUserConfig(newConfig: UserConfig) {
    await this.storage.updateUserConfig(newConfig);
    this.userConfig = newConfig;
    this.userConfigChangedSubject.next(newConfig);
  }


  /* utils */

  private async translateCoors() {
    const { coordinates: c1 } = await this.getMyProfile();
    this.favorites.forEach(favorite => {
      const { coordinates: c2 } = favorite;
      favorite.distance = Utils.getDistanceFromLatLonInKm(c1.lat, c1.lng, c2.lat, c2.lng);
    });
  }

}
