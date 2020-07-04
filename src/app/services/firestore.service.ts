import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference } from '@angular/fire/firestore';
import { User, UserProperties } from '../models/user-model';
import { FirebaseStorage } from './firebase-storage.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { GeoFirestore, GeoQuerySnapshot } from 'geofirestore';
import { firestore } from 'firebase/app';
const { Timestamp } = firestore;
import { LatLng } from 'leaflet';
import { StorageService } from './storage.service';
import * as _ from 'lodash';
import Utils from "src/app/utils";
const { GeoPoint } = firestore;
import { dbKeys } from 'src/app/models/db-keys'
import { Request, RequestStatus, RequestProperties } from 'src/app/models/request-model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

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
    return this.getUserProfile(uid);
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
      .near({ center: new firestore.GeoPoint(coordinates.lat, coordinates.lng), radius: 1000 }) // 1000 km
      .where(`${UserProperties.services}.${categoryName}`, 'array-contains', serviceName)
      .where(UserProperties.professionalProfileActivated, '==', true)
      .get()
      .then(value => this.translateCoordinatesAndSortByDistance(value));

    return this.omitMyProfile(query, uid);
  }

  async findUserByName(userName, categoryFilter) {
    const { uid } = await this.aFAuth.currentUser;
    const user = await this.storage.getUserProfile();

    let query = await this.geofirestore
      .collection(dbKeys.users)
      .near({ center: new firestore.GeoPoint(user.coordinates.lat, user.coordinates.lng), radius: 1000 }) // 1000 km
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

    await docRef.update(value);
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
      if (request.status == RequestStatus.delete) this.removeRequestFromUserList(request);
      else requestList.push(request);
    });

    return requestList.length ? requestList : [];
  }

  async getRequestFromPath(path: string): Promise<Request> {
    const docData = (await this.db.doc(path).get().toPromise());
    const { uid } = await this.aFAuth.currentUser;

    const request = new Request(<Request>docData.data().d);
    request.id = docData.id;
    request.isMine = request.owner == uid;

    if (request.hasImages) request.images = await this.fStorage.getRequestImages(request.id);

    return request;
  }

  async saveRequest(request: Request) {
    if (!request.id) request.id = firestore().collection(dbKeys.requests).doc().id;
    request.owner = (await this.aFAuth.currentUser).uid;

    const { images, ...data } = request;
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

    await this.addRequestToUserList(UserProperties.requests, docRef);
    const requestSaved = await this.getRequestFromPath(docRef.path);
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

  private async addRequestToUserList(list: UserProperties.requests | UserProperties.requestsFollowing, request: DocumentReference) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.users).doc(uid);

    try {
      await docRef.update({ [`d.${list}.${request.id}`]: request.path });
    } catch ({ code }) {
      if (code === 'not-found')
        await docRef.set({ [`d.${list}`]: { [request.id]: request.path } });
    }
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
    return this.db.doc(path).snapshotChanges();
  }

  getMyRequestsAsObservableList(requestListObject: {}) {
    return Object.values(requestListObject)
      .map((path: string) => this.getObservableFromPath(path));
  }
}
