import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user-model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {


  constructor(
    private db: AngularFirestore,
  ) { }


  setUser(uid: string, user: User) {

    this.db.collection('users').doc(uid).set(Object.assign({}, user));
  }
}
