import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User, UserProperties } from '../models/user-model';
import { FirebaseStorage } from './firebase-storage.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { GeoFirestore, GeoQuerySnapshot } from 'geofirestore';
import { firestore } from 'firebase/app';
import { LatLng } from 'leaflet';
import { StorageService } from './storage.service';
import * as _ from 'lodash';
import Utils from "src/app/utils";
const { GeoPoint } = firestore;
import { dbKeys } from 'src/app/models/db-keys'

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  geofirestore: GeoFirestore;

  constructor(
    private db: AngularFirestore,
    private fStorage: FirebaseStorage,
    private aFAuth: AngularFireAuth,
    private storage: StorageService,
  ) {
    this.geofirestore = new GeoFirestore(db.firestore);
  }

  async createUserProfile(uid: string, user: User) {
    const { token, profilePic, ...essentialUserData } = user;
    if (user.hasProfilePic) await this.fStorage.uploadUserProfilePic(user.profilePic, uid);
    return this.db.collection(dbKeys.users).doc(uid).set({
      d: essentialUserData,
    });
  }

  async getUserProfile(uid: string) {
    const user: User = (await this.db.collection(dbKeys.users).doc(uid).get().toPromise()).data().d;
    user.id = uid;
    const coordinates: firestore.GeoPoint = user.coordinates as any;
    if (coordinates) user.coordinates = new LatLng(coordinates.latitude, coordinates.longitude);
    return user;
  }

  async updateUserProfile(user: User) {
    const { uid } = await this.aFAuth.currentUser;
    const { token, profilePic, coordinates, ...essentialUserData } = user;

    _.forEach(essentialUserData, (value, key) => {
      if (value === null) essentialUserData[key] = firestore.FieldValue.delete();
    });

    const dataToUpdate = coordinates == null
      ? essentialUserData
      : {
        coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
        ...essentialUserData
      }
    return this.geofirestore.collection(dbKeys.users).doc(uid).update(dataToUpdate);
  }

  async updateUserLocationAccuracySetting(disable: boolean) {
    const { uid } = await this.aFAuth.currentUser;
    return this.db.collection(dbKeys.users).doc(uid).update({
      [`d.${UserProperties.hideLocationAccuracy}`]: disable,
    });
  }

  async hasFavoritesProperty(hasFavorites: boolean) {
    const { uid } = await this.aFAuth.currentUser;
    return this.db.collection(dbKeys.users).doc(uid).update({
      [`d.${UserProperties.hasFavorites}`]: hasFavorites,
    });
  }

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

  async saveFavorite(userId: string) {
    const { uid } = await this.aFAuth.currentUser;
    const docRef = this.db.collection(dbKeys.favorites).doc(uid);

    try {
      await docRef
        .update({ [`${dbKeys.favoritesList}.${userId}`]: true });
    } catch ({ code }) {
      if (code === 'not-found') await docRef
        .set({ [dbKeys.favoritesList]: { [userId]: true } });
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
    const value = { [`${dbKeys.favoritesList}.${userId}`]: firestore.FieldValue.delete() };

    await docRef.update(value);
  }
}
