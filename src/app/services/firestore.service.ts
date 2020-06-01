import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user-model';
import { FirebaseStorage } from './firebase-storage.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private db: AngularFirestore,
    private fStorage: FirebaseStorage,
  ) { }

  async createUserProfile(uid: string, user: User) {
    const { token, profilePic, ...essentialUserData } = user;
    if (user.hasProfilePic) await this.fStorage.uploadUserProfilePic(user.profilePic, uid);

    return this.db.collection('users').doc(uid).set({
      d: essentialUserData,
    });
  }

  loadUserProfile(uid: string) {
    return this.db.collection('users').doc(uid).get().toPromise()
  }
}
