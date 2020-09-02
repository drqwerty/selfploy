import { Injectable } from '@angular/core';
import { User, UserConfig, UserProperties } from 'src/app/models/user-model';
import { TabBarState } from 'src/app/animations/tab-bar-transition'
import { StorageService } from 'src/app/services/storage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import { Subject, Observable, Subscription } from 'rxjs';
import { Request, RequestStatus } from 'src/app/models/request-model';
import { map, takeWhile, filter, takeUntil, debounceTime } from 'rxjs/operators';
import { Action, DocumentSnapshot } from '@angular/fire/firestore';
import { NotificationService } from '../services/notification.service';
import { dbKeys } from '../models/db-keys';
import { Conversation, Message, ConversationProperties } from '../models/conversation-model';
import { LatLng } from 'leaflet';
import Utils from 'src/app/utils';
import { Review } from '../models/review-model';
import * as moment from 'moment';
import * as diff from 'changeset';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  static tabBarState: TabBarState;
  static conversationOpenedList      : string[] = [];
  static syncFavoritesSubject        = new Subject();

  
  user                               : User;
  favorites                          : User[];
  myRequestList                      : Request[];
  followingRequestList               : Request[];
  conversations                      : { [id: string]: Conversation } = {};
  followingRequestsSubscription      : { [id: string]: Subscription } = {};
  userConfig                         : UserConfig;
  userLogout                         = new Subject<void>();
  newMessageSubject                  = new Subject<string>();
  favoritesChangedSubject            = new Subject<void>();
  myRequestListChangedSubject        = new Subject<void>();
  followingRequestListChangedSubject = new Subject<void>();
  userConfigChangedSubject           = new Subject<UserConfig>();

  constructor(
    private storage       : StorageService,
    private fStorage      : FirebaseStorage,
    private firestore     : FirestoreService,
    private notifications : NotificationService,
  ) { 
    notifications.conversationOpenedList = DataService.conversationOpenedList;    
    DataService.syncFavoritesSubject.pipe(debounceTime(500)).subscribe(() => this.syncFavorites());
  }


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


  async findUserByCompany(companyName: string, categoryFilter: string) {
    return this.firestore.findUserByCompany(companyName, categoryFilter);
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
      DataService.syncFavoritesSubject.next();
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

  
  async updateSavedFavoriteUser(user: User) {
    const favoriteList = await this.storage.getFavorites()
    const favUser = favoriteList.find(({ id }) => id === user.id);
    if (favUser?.avg != user.avg || favUser?.reviews != user.reviews) this.saveFavorite(user);
  }



  /* requests */


  async getRequest(requestId: string) {
    let request: Request, list: Request[];
    list = await this.getMyRequestList();
    request = list.find(request => request.id == requestId);
    if (!request) {
      list = await this.getRequestFollowingList();
      request = list.find(request => request.id == requestId);
    }
    return request;
  }


  private async getRequestList(
    list: Request[],
    requestList: UserProperties.requests | UserProperties.requestsFollowing,
    dbKey: dbKeys.requests | dbKeys.requestsFollowing
  ): Promise<Request[]> {

    list = (await this.storage.getData(dbKey))?.map(request => {
      if (request.startDate) request.startDate = moment(request.startDate);
      if (request.endDate)   request.endDate   = moment(request.endDate);
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


  getTotalNumberCompletedRequestsBy(userId: string) {
    return this.firestore.getTotalNumberCompletedRequestsBy(userId);
  }


  getReviewStats(userId: string) {
    return this.firestore.getReviewStats(userId);
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

    const { requestsFollowing } = await this.getMyProfile();
    if (!requestsFollowing) return;

    Object.keys(requestsFollowing).forEach(id => this.observeFollowingRequest(id, requestsFollowing[id]));

    (await this.firestore.getFollowingRequestListObservable())
      .pipe(takeUntil(this.userLogout))
      .subscribe((requestsFollowingList) => {

        const listDiff = <{ type: "put" | "del", key: string[], value?: string }[]>diff(requestsFollowing, requestsFollowingList);

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

      });
  }


  private observeMyRequest(observable: Observable<Action<DocumentSnapshot<any>>>) {
    this.observeRequest(observable, true);
  }


  private observeFollowingRequest(id: string, path: string) {
    this.followingRequestsSubscription[id] = this.observeRequest(this.firestore.getObservableFromPath(path), false)
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


  completeRequest(request: Request, completedById: string) {
    request.completedBy = completedById;
    request.status      = RequestStatus.completed;
    this.saveRequest(request);
  }


  resetRequestStates() {
    this.firestore.setAllRequestToDraftState();
  }


  /* conversations */


  sendText(requestId: string, partnerId: string, conversationId: string, message: string) {
    return this.sendMessage({ requestId, partnerId, conversationId, content: message, type: ConversationProperties.isText });
  }


  sendLocation(requestId: string, partnerId: string, conversationId: string, address: string, coordinates: LatLng) {
    return this.sendMessage({ requestId, partnerId, conversationId, address, coordinates, type: ConversationProperties.isCoordinate })
  }


  async sendImage(conversationId: string, imageBase64: string, requestId: string, partnerId: string) {

    if (!conversationId) {
      const { id } = await this.getMyProfile();
      conversationId = await this.firestore.createConversation(requestId, partnerId, id)
    }

    const url = await this.fStorage.uploadImageToConversation(imageBase64, conversationId);
    return this.sendMessage({ requestId, partnerId, conversationId, content: url, type: ConversationProperties.isImage });
  }


  async sendMessage(options:
    {
      requestId      : string,
      partnerId      : string,
      conversationId : string,
      content?       : string,
      address?       : string,
      coordinates?   : LatLng,
      type           : ConversationProperties.isText | ConversationProperties.isImage | ConversationProperties.isCoordinate,
    },) {
    await this.firestore.sendMessage(options);

    let message: string;
    switch (options.type) {
      case ConversationProperties.isText:
        message = options.content;
        break;
      case ConversationProperties.isImage:
        message = '📷 Foto';
        break;
      case ConversationProperties.isCoordinate:
        message = '📍 ' + options.address;
        break;
    }

    await this.sendMessageNotification(options.partnerId, message, options.requestId, options.conversationId)
  }


  saveMessages(conversation: Conversation, messages: Message[]) {

    if (!this.conversations.hasOwnProperty(conversation.id)) {
      conversation.messages = {};
      this.conversations[conversation.id] = conversation;
    }

    messages.forEach(message => this.conversations[conversation.id].messages[message.id] = message);
    this.storage.saveConversations(this.conversations);

    this.newMessageSubject.next(conversation.id);
  }


  async observeMyConversations() {

    this.conversations = await this.storage.getConversations() ?? {};
    Object.
      values(this.conversations)
      .forEach(conversation => Object.values(conversation.messages)
        .forEach(message => message.timestamp = moment(message.timestamp))
      )

    const { id: uid } = await this.getMyProfile();
    (await this.firestore.getMyConversationListObserver(uid))
      .subscribe(conversationList => {

        conversationList.forEach(async conversation => {

          this.getRequest(conversation.request).then(request => {
            if (!request.contactsTotalNumber) request.contactsTotalNumber = 1;
            else request.contactsTotalNumber++;
          })

          let activeRequest = this.followingRequestList?.findIndex(request => request.id === conversation.request) > -1;
          if (!activeRequest) activeRequest = this.myRequestList.findIndex(request => request.id === conversation.request) > -1;

          if (activeRequest) {
            conversation.anotherUser = await this.getAnotherUser(uid, conversation.participants);
            (await this.firestore.getConversationObserver(conversation.id, uid))
              .subscribe(messages => this.saveMessages(conversation, messages))
          }
        })
      })
  }


  getAnotherUser(uid: string, participantsI: any) {
    const participants = Object.keys(participantsI);
    const anotherUser = participants[1 - participants.indexOf(uid)];
    return this.getUserProfile(anotherUser)
  }


  getConversation(requestId: string, partnerId: string) {
    return Object
      .values(this.conversations)
      .find(conversation => conversation.request == requestId && conversation.participants[partnerId]);
  }


  getConversationFromId(conversationId: string) {
    return Object
      .values(this.conversations)
      .find(({ id }) => id === conversationId);
  }


  getConversationFromRequest(requestId: string) {
    return Object
      .values(this.conversations)
      .filter(({ request }) => request == requestId);
  }


  async setMessagesAsReaded(conversationId: string) {
    const messages = Object.values(this.conversations).find(({ id }) => id == conversationId).messages;

    const notReadedMessages = Object.values(messages)
      .filter(({ fromMe, readed }) => !fromMe && !readed);

    notReadedMessages.forEach(message => message.readed = true);

    this.firestore.setMessagesAsReaded(conversationId, notReadedMessages);
    this.storage.saveConversations(this.conversations);
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


  async sendMassiveRequestNotifications(requestData: { id: string; path: string; requestSaved: Request; }) {
    const { category, service, coordinates } = requestData.requestSaved;
    const { name: ownersName } = await this.getMyProfile();
    const professionalList     = await this.firestore.findProfessionalOf(category, service, coordinates);

    const { fcmTokenList, professionalIdList } = this.filterProfesionalList(professionalList, requestData)

    this.sendRequestNotifications(professionalIdList, requestData, fcmTokenList, ownersName);
  }


  async sendRequestNotificationsTo(requestData: { id: string; path: string; requestSaved: Request; }, professionalList: User[]) {
    const { name: ownersName } = await this.getMyProfile();

    const fcmTokenList       = professionalList.map(professional => professional.fcmToken);
    const professionalIdList = professionalList.map(professional => professional.id);
 
    this.sendRequestNotifications(professionalIdList, requestData, fcmTokenList, ownersName);
  }
  
  

  private sendRequestNotifications(professionalIdList: string[], requestData: { id: string; path: string; requestSaved: Request; }, fcmTokenList: string[], ownersName: string) {
    const { id, path, requestSaved: { service } } = requestData;
    this.firestore.addRequestToFollowingUsersList(professionalIdList, { id, path });
    
    if (fcmTokenList.length) {
      this.notifications.sendRequestNotification(
        'Nuevo trabajo disponible',
        `${ownersName} necesita un servicio de ${service}`,
        fcmTokenList,
        id);
    }
  }


  async sendMessageNotification(userId: string, message: string, requestId: string, conversationId: string) {
    const { name } = await this.getMyProfile();
    const { fcmToken } = await this.getUserProfile(userId);
    this.notifications.sendMessageNotification(name, message, fcmToken, requestId, conversationId);
  }


  private filterProfesionalList(list: User[], requestData) {
    let filteredProfessionalList = list
      // .filter(user => user.fcmToken)
      .filter(user => user.distance <= user.radiusKm);

    if (!requestData.requestSaved.priority)
      filteredProfessionalList = filteredProfessionalList
        .filter(user => user.workingHours.some(wh => requestData.requestSaved.workingHours.includes(wh)));

    const fcmTokenList = filteredProfessionalList
      .map(professional => professional.fcmToken);

    const professionalIdList = filteredProfessionalList
      .map(professional => professional.id);

    return {fcmTokenList, professionalIdList};
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


  /* reviews */


  getFirstUserOfRequestConversations(requestId: string): User | undefined {
    return Object
      .values(this.conversations)
      .find(({ request }) => request === requestId)
      ?.anotherUser;
  }

  
  async postReview(userId: string, starRating: number, text: string) {
    const { id } = await this.getMyProfile();

    const review = new Review();
    review.ownerId = id;
    review.professionalId = userId;
    review.stars = starRating;
    review.text = text

    this.firestore.postReview(review)
  }


  getAllReviewFrom(userId: string) {
    return this.firestore.getAllReviewFrom(userId);
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
