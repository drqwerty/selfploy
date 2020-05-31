import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from '../models/user-model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private db: AngularFirestore,
  ) { }

  createUserProfile(uid: string, user: User) {
    const {token, ...userWithoutToken} = user;
    return this.db.collection('users').doc(uid).set({
      d: userWithoutToken,
    });
  }

  loadUserProfile(uid: string) {
    return this.db.collection('users').doc(uid).get().toPromise()
  }
}
