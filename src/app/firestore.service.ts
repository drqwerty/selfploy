import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(
    private db: AngularFirestore,
  ) { }

  setData() {
    this.db.collection('test').doc('doctest').set({param1: 5});
  }
}
