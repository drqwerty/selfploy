import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user-model';
import { FirebaseStorage } from './firebase-storage.service';
import { AngularFireAuth } from '@angular/fire/auth';

import { GeoFirestore, GeoQuerySnapshot } from 'geofirestore';
import { firestore } from 'firebase/app';
import { LatLng } from 'leaflet';
import { DataService } from '../providers/data.service';
import { StorageService } from './storage.service';
import * as _ from 'lodash';
import Utils from "src/app/utils";

const { GeoPoint } = firestore;


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  geofirestore: GeoFirestore;

  constructor(
    private db: AngularFirestore,
    private fStorage: FirebaseStorage,
    private aFAuth: AngularFireAuth,
    private data: DataService,
    private storage: StorageService,
  ) {
    this.geofirestore = new GeoFirestore(db.firestore);
  }

  async createUserProfile(uid: string, user: User) {
    const { token, profilePic, ...essentialUserData } = user;
    if (user.hasProfilePic) await this.fStorage.uploadUserProfilePic(user.profilePic, uid);
    return this.db.collection('users').doc(uid).set({
      d: essentialUserData,
    });
  }

  async getUserProfile(uid: string) {
    const user: User = (await this.db.collection('users').doc(uid).get().toPromise()).data().d;
    const coordinates: firestore.GeoPoint = user.coordinates as any;
    if (coordinates) user.coordinates = new LatLng(coordinates.latitude, coordinates.longitude);
    return user;
  }

  async updateUserProfile(user: User) {
    const currentUser = await this.aFAuth.currentUser;
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
    return this.geofirestore.collection('users').doc(currentUser.uid).update(dataToUpdate);
  }

  async updateUserLocationAccuracySetting(disable: boolean) {
    const currentUser = await this.aFAuth.currentUser;
    return this.db.collection('users').doc(currentUser.uid).update({
      'd.hideLocationAccuracy': disable,
    });
  }

  async findProfessionalOf(categoryName, serviceName) {
    const currentUserUid = (await this.aFAuth.currentUser).uid;
    const user = this.data.user ?? await this.storage.getUserProfile();

    const query = await this.geofirestore
      .collection('users')
      .near({ center: new firestore.GeoPoint(user.coordinates.lat, user.coordinates.lng), radius: 1000 }) // 1000 km
      .where(`services.${categoryName}`, 'array-contains', serviceName)
      .where('professionalProfileActivated', '==', true)
      .get()
      .then(value => this.translateCoordinatesAndSortByDistance(value));

    return this.omitMyProfile(query, currentUserUid);
  }

  async findUserByName(userName, categoryFilter) {
    const currentUserUid = (await this.aFAuth.currentUser).uid;
    const user = this.data.user ?? await this.storage.getUserProfile();

    let query = await this.geofirestore
      .collection('users')
      .near({ center: new firestore.GeoPoint(user.coordinates.lat, user.coordinates.lng), radius: 1000 }) // 1000 km
      .where('name_splited', 'array-contains', Utils.normalize(userName))
      .get()
      .then(value => this.translateCoordinatesAndSortByDistance(value));

    if (categoryFilter) query = query.filter(user => user.services[categoryFilter])

    return this.omitMyProfile(query, currentUserUid);
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
}
