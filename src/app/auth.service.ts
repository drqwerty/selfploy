import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from './user-model';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

import "@codetrix-studio/capacitor-google-auth";
import { Plugins } from '@capacitor/core';
const { GoogleAuth } = Plugins;
import * as firebase from 'firebase';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState = new BehaviorSubject(null);

  constructor(
    private AFauth: AngularFireAuth,
    private storageService: StorageService,
    private firestoreService: FirestoreService,
  ) { }


  updateAuthState() {

    return new Promise(resolve => {
      this.storageService.getUserProfile().then(data => {
        this.authState.next(data.value != null);
        resolve(this.authState.value);
      })
    })
  }


  loginWithEmailAndPassword(email: string, password: string) {

    return this.loadAndSaveUserProfile(this.AFauth.signInWithEmailAndPassword(email, password));
  }


  loginWithGoogle(idToken: string) {

    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    return this.loadAndSaveUserProfile(this.AFauth.signInWithCredential(credential));
  }


  loadAndSaveUserProfile(signInPromise: Promise<firebase.auth.UserCredential>) {

    return new Promise((resolve, reject) => {
      signInPromise
        .then(userCrendential => {
          this.authState.next(true);
          this.firestoreService.loadUserProfile(userCrendential.user.uid).then(documentSnapshot => {
            this.storageService.saveUserProfile(documentSnapshot.data().d);
            resolve(userCrendential);
          })
        })
        .catch(reason => reject(reason));
    });
  }


  async getGoogleUser() {

    return await GoogleAuth.signIn();
  }


  async signOut() {

    await GoogleAuth.signOut();
  }


  logout() {

    this.authState.next(false);
    this.AFauth.signOut();

    // TODO: choose method
    GoogleAuth.signOut();
  }


  checkEmail(email: string) {

    return this.AFauth.fetchSignInMethodsForEmail(email);
  }


  signUpWithEmailAndPassword(user: User, password: string) {

    return this.createAndSaveUserProfile(user, this.AFauth.createUserWithEmailAndPassword(user.email, password));
  }


  signUpWithGoogle(user: User, idToken: string) {

    const credential = firebase.auth.GoogleAuthProvider.credential(idToken);
    return this.createAndSaveUserProfile(user, this.AFauth.signInWithCredential(credential));
  }


  createAndSaveUserProfile(user: User, signUpPromise: Promise<firebase.auth.UserCredential>) {

    return new Promise((resolve, reject) => {
      signUpPromise
        .then(userCrendential => {
          this.authState.next(true);
          Promise.all([
            this.storageService.saveUserProfile(user),
            this.firestoreService.createUserProfile(userCrendential.user.uid, user),
          ]).then(() => resolve());
        })
        .catch(reason => reject(reason));
    })
  }


  isAuthenticated() {

    return this.authState.value;
  }
}
