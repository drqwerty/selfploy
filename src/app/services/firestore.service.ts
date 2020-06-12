import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user-model';
import { FirebaseStorage } from './firebase-storage.service';
import { AngularFireAuth } from '@angular/fire/auth';

import { GeoCollectionReference, GeoFirestore, GeoQuery, GeoQuerySnapshot } from 'geofirestore';
import { firestore } from 'firebase/app';
import { LatLng } from 'leaflet';
const { GeoPoint } = firestore;


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  geofirestore: GeoFirestore;

  constructor(
    private db: AngularFirestore,
    private fStorage: FirebaseStorage,
    private AFauth: AngularFireAuth,
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
    const coordinates = user.coordinates as unknown as firestore.GeoPoint;
    user.coordinates = new LatLng(coordinates.latitude, coordinates.longitude);
    return user;
  }

  async updateUserProfile(user: User) {
    const currentUser = await this.AFauth.currentUser;
    const { token, profilePic, coordinates, ...essentialUserData } = user;

    return this.geofirestore.collection('users').doc(currentUser.uid).update({
      coordinates: new GeoPoint(coordinates.lat, coordinates.lng),
      ...essentialUserData
    });
  }
}
