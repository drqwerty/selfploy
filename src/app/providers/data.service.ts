import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { TabBarState } from 'src/app/animations/tab-bar-transition'
import { StorageService } from 'src/app/services/storage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import Utils from 'src/app/utils';
import { Subject, Observable } from 'rxjs';
import { Request, RequestStatus } from 'src/app/models/request-model';
import { map, takeWhile, filter } from 'rxjs/operators';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  static tabBarState: TabBarState;

  public user: User;
  public favorites: User[];
  public requests: Request[];
  public myRequests: Request[];
  public followingRequests: Request[];
  public favoritesChangedSubject = new Subject<void>();
  public requestsChangedSubject = new Subject<void>();

  constructor(
    private storage: StorageService,
    private fStorage: FirebaseStorage,
    private firestore: FirestoreService,
  ) { }

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
    this.requests = null;
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

  getUserProfilePic(uid: string) {
    return this.fStorage.getUserProfilePic(uid);
  }

  async findProfessionalOf(categoryName: string, serviceName: string) {
    return this.firestore.findProfessionalOf(categoryName, serviceName, (await this.getMyProfile()).coordinates);
  }

  async findUserByName(userName: string, categoryFilter: string) {
    return this.firestore.findUserByName(userName, categoryFilter);
  }

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

  private async translateCoors() {
    const { coordinates: c1 } = await this.getMyProfile();
    this.favorites.forEach(favorite => {
      const { coordinates: c2 } = favorite;
      favorite.distance = Utils.getDistanceFromLatLonInKm(c1.lat, c1.lng, c2.lat, c2.lng);
    });
  }

  async getRequestList(): Promise<Request[]> {
    if (!(await this.getMyProfile()).requests) return [];

    if (!this.requests) {
      this.requests = (await this.storage.getRequestList())?.map(request => {
        if (request.startDate) request.startDate = moment(request.startDate);
        if (request.endDate) request.endDate = moment(request.endDate);
        return request;
      });

      if (!this.requests) {
        this.requests = await this.firestore.getRequestList((await this.getMyProfile()).requests);
        await this.storage.saveRequests(this.requests);
      }
    }

    return this.requests;
  }

  async saveRequest(request: Request) {

    if (request.id) {
      await this.firestore.saveRequest(request);
      // el observador la guarda en local
      // await this.storage.saveRequest(await this.getRequestList(), request);

    } else {
      const { path, requestSaved } = await this.firestore.saveRequest(request);
      request = new Request(requestSaved);
      this.requests = await this.storage.saveRequest(await this.getRequestList(), request);
      this.observeRequest(this.firestore.getObservableFromPath(path));
      await this.updateRequestList(requestSaved.id, path);
    }
  }

  async updateLocalRequest(request: Request) {
    this.requests = await this.storage.updateRequest(await this.getRequestList(), request);
  }

  async removeRequest(request: Request) {
    this.requests = await this.storage.removeRequest(await this.getRequestList(), request);
    this.firestore.removeRequest(request);
    this.updateRequestList(request.id, null, true);
  }

  private async updateRequestList(id, path, remove = false) {
    const user = await this.getMyProfile();

    if (remove) {
      delete user.requests[id];
    } else {
      if (!user.requests) user.requests = {};
      user.requests[id] = path;
    }

    await this.saveUserProfile(this.user);
    this.requestsChangedSubject.next();
  }

  async observeMyRequests() {
    const { requests } = await this.getMyProfile();
    if (!requests) return;
    const obsevableList = await this.firestore.getMyRequestsAsObservableList(requests);

    obsevableList.forEach(observable => this.observeRequest(observable));
  }

  private async observeRequest(observable: Observable<Action<DocumentSnapshot<any>>>) {
    const { id: userId } = await this.getMyProfile();
    observable
      .pipe(
        map(({ payload }) => {
          const id = payload.id;
          const data = <Request>(payload.data())?.d;
          const isMine = data?.owner == userId;
          return { id, isMine, ...data };
        }),
        takeWhile(request => request?.status != RequestStatus.closed, true),
        filter(request => !!request.lastEditAt),
      )
      .subscribe(async requestChanged => {
        const requestList = await this.getRequestList();
        const localRequest = requestList.find(request => request.id == requestChanged.id);
        if (localRequest?.lastEditAt.seconds != requestChanged.lastEditAt.seconds) {
          const requestUpdated = new Request(requestChanged);
          if (requestUpdated.hasImages) requestUpdated.images = await this.fStorage.getRequestImages(localRequest.id);

          this.updateLocalRequest(requestUpdated);
        }
      });
  }

}
