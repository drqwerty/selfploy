import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, Action, DocumentSnapshot } from '@angular/fire/firestore';
import { User, UserProperties } from '../models/user-model';
import { FirebaseStorage } from './firebase-storage.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { GeoFirestore, GeoQuerySnapshot } from 'geofirestore';
import { firestore } from 'firebase/app';
import { LatLng } from 'leaflet';
import { StorageService } from './storage.service';
import * as _ from 'lodash';
import Utils from "src/app/utils";
import { dbKeys } from 'src/app/models/db-keys'
import { Request, RequestStatus, RequestProperties } from 'src/app/models/request-model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Message, Conversation, ConversationProperties } from '../models/conversation-model';
import * as moment from 'moment';
import { Review, ReviewProperties } from '../models/review-model';
const { GeoPoint, Timestamp } = firestore;
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  readonly DEFAULT_RADIUS = 30;

  private prodMode = true;

  geofirestore: GeoFirestore;

  constructor(
    private db: AngularFirestore,
    private fStorage: FirebaseStorage,
    private aFAuth: AngularFireAuth,
    private storage: StorageService,
  ) {
    this.geofirestore = new GeoFirestore(db.firestore);
  }


  /* user profile */

  async createUserProfile(uid: string, user: User) {
    const { token, profilePic, ...essentialUserData } = user;
    if (user.hasProfilePic) await this.fStorage.uploadUserProfilePic(user.profilePic, uid);
    await this.db.collection(dbKeys.users).doc(uid).set({
      d: {
        [UserProperties.lastEditAt]: firestore.FieldValue.serverTimestamp(),
        ...essentialUserData,
      },
    });
    return this.getUserProfile(uid);
  }


  async getUserProfile(uid: string) {
    const user: User = (await this.db.collection(dbKeys.users).doc(uid).get().toPromise()).data()?.d;
    if (!user) throw { code: "Perfil eliminado", error: new Error() };
    user.id = uid;
    if (user.hasProfilePic) user.profilePic = await this.fStorage.getUserProfilePic(uid);
    const coordinates: firestore.GeoPoint = user.coordinates as any;
    if (coordinates) user.coordinates = new LatLng(coordinates.latitude, coordinates.longitude);
    return user;
  }


  async updateUserProfile(user: User) {
    const { uid } = await this.aFAuth.currentUser;
    const { token, profilePic, coordinates, lastEditAt, ...essentialUserData } = user;

    _.forEach(essentialUserData, (value, key) => {
      if (value === null) essentialUserData[key] = firestore.FieldValue.delete();
    });

    const dataToUpdate = coordinates == null
      ? {
        ...essentialUserData,
        [UserProperties.lastEditAt]: firestore.FieldValue.serverTimestamp(),
      }
      : {
        coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
        [UserProperties.lastEditAt]: firestore.FieldValue.serverTimestamp(),
        ...essentialUserData,
      }
    await this.geofirestore.collection(dbKeys.users).doc(uid).update(dataToUpdate);

    let userUpdated: User;
    do {
      userUpdated = await this.getUserProfile(uid);
    } while (userUpdated.lastEditAt == null);

    return userUpdated;
  }


  async updateUserLocationAccuracySetting(disable: boolean) {
    const { uid } = await this.aFAuth.currentUser;
    await this.db.collection(dbKeys.users).doc(uid).update({
      [`d.${UserProperties.hideLocationAccuracy}`]: disable,
      [`d.${UserProperties.lastEditAt}`]: firestore.FieldValue.serverTimestamp(),
    });
    return this.getUserProfile(uid);
  }


  async updateUserHasFavoritesProperty(hasFavorites: boolean) {
    const { uid } = await this.aFAuth.currentUser;
    await this.db.collection(dbKeys.users).doc(uid).update({
      [`d.${UserProperties.hasFavorites}`]: hasFavorites,
      [`d.${UserProperties.lastEditAt}`]: firestore.FieldValue.serverTimestamp(),
    });
    return this.getUserProfile(uid);
  }


  /* find users */

  async findProfessionalOf(categoryName, serviceName, coordinates) {
    const { uid } = await this.aFAuth.currentUser;

    const query = await this.geofirestore
      .collection(dbKeys.users)
      .near({ center: new firestore.GeoPoint(coordinates.lat, coordinates.lng), radius: this.DEFAULT_RADIUS })
      .where(`${UserProperties.services}.${categoryName}`, 'array-contains', serviceName)
      .where(UserProperties.professionalProfileActivated, '==', true)
      .get()
      .then(value => this.translateCoordinatesAndSortByDistance(value));

    const userList = this.omitMyProfile(query, uid);

    for await (const user of userList) {
      const { avg, reviews } = await this.getReviewStats(user.id);
      user.avg = avg;
      user.reviews = reviews;
      user.completedRequests = await this.getTotalNumberCompletedRequestsBy(user.id);
    }

    return userList;
  }


  async findUserByName(userName, categoryFilter) {
    const { uid } = await this.aFAuth.currentUser;
    const user = await this.storage.getUserProfile();

    let query = await this.geofirestore
      .collection(dbKeys.users)
      .near({ center: new firestore.GeoPoint(user.coordinates.lat, user.coordinates.lng), radius: this.DEFAULT_RADIUS })
      .where(UserProperties.name_splited, 'array-contains', Utils.normalize(userName))
      .get()
      .then(value => this.translateCoordinatesAndSortByDistance(value));

    if (categoryFilter) query = query.filter(user => user.services[categoryFilter])

    return this.omitMyProfile(query, uid);
  }


  private translateCoordinatesAndSortByDistance(value: GeoQuerySnapshot) {
    return value.docs
      .sort(({ distance: a }, { distance: b }) => a - b)
      .map(snap => {
        const user: User = snap.data();
        const coordinates: firestore.GeoPoint = user.coordinates as any;
        if (coordinates) user.coordinates = new LatLng(coordinates.latitude, coordinates.longitude);
        return { id: snap.id, distance: snap.distance, ...user } as User;
      });
  }


  private omitMyProfile(profiles: User[], id: string) {
    const myUserIndex = profiles.findIndex(user => user.id === id);
    if (myUserIndex != -1) profiles.splice(myUserIndex, 1);
    return profiles;
  }


  async getAllUsers() {
    const query = await this.geofirestore
      .collection(dbKeys.users)
      .get();

    return this.translateCoordinatesAndSortByDistance(query);
  }


  /* favorites */

  async saveFavorite(userId: string) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.favorites).doc(uid);

    try {
      await docRef
        .update({ [`${dbKeys.favoriteList}.${userId}`]: true });
    } catch ({ code }) {
      if (code === 'not-found') await docRef
        .set({ [dbKeys.favoriteList]: { [userId]: true } });
    }
  }


  async getFavorites() {
    const favoriteList = await this.getFavoriteList();
    return Promise.all(favoriteList.map(async id => {
      const user = await this.getUserProfile(id);
      user.isFav = true;
      return user;
    }));
  }


  private async getFavoriteList() {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.favorites).doc(uid);
    const list = (await docRef.get().toPromise()).data()?.list ?? {};
    return Object.keys(list);
  }


  async removeFavorite(userId: string) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.favorites).doc(uid);
    const value = { [`${dbKeys.favoriteList}.${userId}`]: firestore.FieldValue.delete() };

    try { await docRef.update(value); } catch { }
  }


  /* requests */

  async removeRequest(request: Request) {
    await this.removeRequestFromUserList(request);

    if (this.prodMode) {
      if (request.isMine) {
        this.db.collection(dbKeys.requests).doc(request.id).delete();
        this.fStorage.deleteRequestImages(request.id);
      }

    } else {
      if (request.isMine) {
        this.db.collection(dbKeys.requests).doc(request.id).update({
          [`d.${RequestProperties.status}`]: RequestStatus.delete,
        });
      }
    }
  }


  async getRequestList(requestListObject) {
    if (!requestListObject) return [];
    const requestList = [];
    const requests = await Promise.all(Object.values(requestListObject).map((path: string) => this.getRequestFromPath(path)));
    requests.forEach(request => {
      if (!request) return;
      if (request.status == RequestStatus.delete) this.removeRequestFromUserList(request);
      else requestList.push(request);
    });

    return requestList.length ? requestList : [];
  }


  async getRequestFromPath(path: string): Promise<Request> {
    const docData = (await this.db.doc(path).get().toPromise());
    const { uid } = await this.aFAuth.currentUser;

    if (!docData.exists) return null;

    const request = new Request(<Request>docData.data().d);
    request.id = docData.id;
    request.isMine = request.owner == uid;

    if (request.hasImages) request.images = await this.fStorage.getRequestImages(request.id);

    return request;
  }


  async getTotalNumberCompletedRequestsBy(userId: string) {
    const snapshot = await this.db
      .collection(dbKeys.requests, ref => ref.where(`d.${RequestProperties.completedBy}`, '==', userId))
      .get()
      .toPromise();
      
    return snapshot.size;
  }


  async getReviewStats(userId: string) {
    const snapshot = await this.db
      .collection(dbKeys.reviews, ref => ref.where(`${ReviewProperties.professionalId}`, '==', userId))
      .get()
      .toPromise();

    if (!snapshot.size) return { avg: 0, reviews: 0 };
      
    const sum = snapshot.docs
      .map(doc => (<Review>doc.data()).stars)
      .reduce(( a, b ) => a + b, 0);
    const avg = sum/snapshot.size
      
    return { avg, reviews: snapshot.size };
  }


  async saveRequest(request: Request) {
    if (!request.id) request.id = firestore().collection(dbKeys.requests).doc().id;
    request.owner = (await this.aFAuth.currentUser).uid;

    const { images, isMine, ...data } = request;
    const docData = Object.assign({}, data);

    if (request.startDate?.constructor.name == 'Moment') {
      if (request.startDate) docData.startDate = Timestamp.fromDate(request.startDate.toDate());
      if (request.endDate) docData.endDate = Timestamp.fromDate(request.endDate.toDate());
    }

    if (request.hasImages) await this.fStorage.uploadRequestImageList(images, request.id);

    let docRef: DocumentReference;
    if (request.coordinates) {
      docRef = await this.saveRequestWithGeopoint(docData);
    } else {
      docRef = await this.saveRequestWithoutGeopoint(docData);
    }

    await this.addRequestToUserList(docRef);
    const requestSaved = await this.getRequestFromPath(docRef.path);
    if (!requestSaved) return null;
    return { id: docRef.id, path: docRef.path, requestSaved };
  }


  private async saveRequestWithGeopoint(docData): Promise<DocumentReference> {
    if (docData.coordinates.lat)
      docData.coordinates = new GeoPoint(docData.coordinates.lat, docData.coordinates.lng);
    docData.lastEditAt = firestore.FieldValue.serverTimestamp();
    await this.geofirestore.collection(dbKeys.requests).doc(docData.id).set(docData);
    const docRef = this.db.collection(dbKeys.requests).doc(docData.id).ref;
    return docRef;
  }


  private async saveRequestWithoutGeopoint(docData): Promise<DocumentReference> {
    docData.lastEditAt = firestore.FieldValue.serverTimestamp();
    const docRef = this.db.collection(dbKeys.requests).doc(docData.id).ref;
    await docRef.set({ d: docData });
    return docRef;
  }


  private async addRequestToUserList(request: DocumentReference | { id: string, path: string }) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.users).doc(uid);

    try {
      await docRef.update({ [`d.${UserProperties.requests}.${request.id}`]: request.path });
    } catch ({ code }) {
      if (code === 'not-found')
        await docRef.set({ [`d.${UserProperties.requests}`]: { [request.id]: request.path } });
    }
  }


  async addRequestToFollowingUsersList(ids: string[], request: DocumentReference | { id: string, path: string }) {
    Promise.all([
      ids.map(async id => {
        const docRef = this.db.collection(dbKeys.users).doc(id);

        try {
          await docRef.update({ [`d.${UserProperties.requestsFollowing}.${request.id}`]: request.path });
        } catch ({ code }) {
          if (code === 'not-found')
            await docRef.set({ [`d.${UserProperties.requestsFollowing}`]: { [request.id]: request.path } });
        }
      })
    ])

  }


  private async removeRequestFromUserList(request: Request) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.users).doc(uid);
    const list = request.owner == uid ? UserProperties.requests : UserProperties.requestsFollowing;

    try {
      await docRef.update({ [`d.${list}.${request.id}`]: firestore.FieldValue.delete() });
    } catch  { }
  }


  getObservableFromPath(path: string) {
    return <Observable<Action<DocumentSnapshot<any>>>>this.db.doc(path).snapshotChanges();
  }


  getMyRequestsAsObservableList(requestListObject: {}) {
    return Object.values(requestListObject)
      .map((path: string) => this.getObservableFromPath(path));
  }


  async getFollowingRequestListObservable() {
    const { uid } = await this.aFAuth.currentUser;
    return this.db
      .collection(dbKeys.users)
      .doc(`${uid}`)
      .valueChanges()
      .pipe(map(({ d }: { d: User }) => d.requestsFollowing));
  }


  setAllRequestToDraftState() {
    this.db.collection(dbKeys.requests)
      .get()
      .toPromise()
      .then(data =>
        data.docs.forEach(doc =>
          this.db.doc(doc.ref.path).update({ 'd.status': 0 })));
  }


  /* conversations */

  async getMyConversationListObserver(uid: string) {
    return this.db
      .collection(dbKeys.conversations, ref => ref.where(`participants.${uid}`, '==', true))
      .stateChanges(["added"])
      .pipe(
        map(conversations =>
          conversations.map(({ payload }) => {
            const id = payload.doc.id;
            const data = <Conversation>payload.doc.data();
            return { id, ...data };
          }))
      )
  }


  async getConversationObserver(conversationId: string, uid: string) {
    return this.db
      .collection(dbKeys.conversations)
      .doc(conversationId)
      .collection(dbKeys.messages, ref => ref.orderBy(ConversationProperties.timestamp))
      .stateChanges(["added"])
      .pipe(
        map(messages =>
          messages.map(({ payload }) => {
            const id = payload.doc.id;
            const data = <Message>payload.doc.data();
            data.fromMe = data.senderUid == uid;
            data.timestamp = payload.doc.metadata.hasPendingWrites
              ? moment()
              : moment(data.timestamp.toDate());
            if (data.isCoordinate) {
              const coords = <firestore.GeoPoint>data.coordinates;
              data.coordinates = new LatLng(coords.latitude, coords.longitude);
            }
            return { id, ...data };
          }))
      )
  }


  async createConversation(requestId: string, partner: string, uid: string) {

    const conversationId = firestore().collection(dbKeys.conversations).doc().id;

    await this.db
      .collection(dbKeys.conversations)
      .doc(conversationId)
      .set({
        [ConversationProperties.request]: requestId,
        [ConversationProperties.participants]: {
          [partner]: true,
          [uid]: true
        }
      })

    return conversationId;
  }


  async sendMessage(
    options:
      {
        requestId      : string,
        partnerId      : string,
        conversationId : string,
        content?       : string,
        address?       : string,
        coordinates?   : LatLng,
        type           : ConversationProperties.isText | ConversationProperties.isImage | ConversationProperties.isCoordinate,
      },
    ) {
    const { uid } = await this.aFAuth.currentUser;

    if (!options.conversationId) options.conversationId = await this.createConversation(options.requestId, options.partnerId, uid);

    const data = {
      [ConversationProperties.readed]    : false,
      [ConversationProperties.senderUid] : uid,
      [ConversationProperties.timestamp] : firestore.FieldValue.serverTimestamp(),
      [options.type]                     : true,
    };

    switch (options.type) {
      case ConversationProperties.isText:
        data[ConversationProperties.text] = options.content;
        break;

      case ConversationProperties.isImage:
        data[ConversationProperties.url] = options.content;
        break;

      case ConversationProperties.isCoordinate:
        data[ConversationProperties.address]     = options.address;
        data[ConversationProperties.coordinates] = new GeoPoint(options.coordinates.lat, options.coordinates.lng);
        break;
    }

    await this.db
      .collection(dbKeys.conversations)
      .doc(options.conversationId)
      .collection(dbKeys.messages)
      .add(data)
  }


  setMessagesAsReaded(conversationId: string, messages: Message[]) {
    const updateBatch = this.db.firestore.batch();

    messages.forEach(message => {
      const docRef = this.db.doc(`${dbKeys.conversations}/${conversationId}/${dbKeys.messages}/${message.id}`).ref;
      updateBatch.update(docRef, {[ConversationProperties.readed]: message.readed})
    });

    updateBatch.commit();
  }


  /* reviews */

  async postReview(review: Review) {
    (<firestore.FieldValue>review.timestamp) = firestore.FieldValue.serverTimestamp();
    await this.db
      .collection(dbKeys.reviews)
      .add(Object.assign({}, review));
  }


  async getAllReviewFrom(userId: string) {
    const reviews = await this.db
      .collection(dbKeys.reviews, ref => ref.where(`${ReviewProperties.professionalId}`, '==', userId))
      .get()
      .toPromise();

    const reviewList = reviews.docs.map(doc => {
      const review = new Review(doc.data())
      review.id = doc.id;
      return review;
    });
    
    const userList: User[] = [];
    for await (const review of reviewList) {
      const user = await this.getUserProfile(review.ownerId);
      userList.push(user)
    }

    return  reviewList.map((review, index) => {
      return {review, user: userList[index]}
    });
  }


  /* notifications */

  async saveFCMToken(fcmToken: string) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.users).doc(uid);

    try {
      await docRef.update({ [`d.${UserProperties.fcmToken}`]: fcmToken });
    } catch ({ code }) {
      if (code === 'not-found')
        await docRef.set({ [`d.${UserProperties.fcmToken}`]: fcmToken });
    }
  }
}
