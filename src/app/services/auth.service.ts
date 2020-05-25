import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from '../models/user-model';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

import "@codetrix-studio/capacitor-google-auth";
import { Plugins } from '@capacitor/core';
const { GoogleAuth } = Plugins;
import * as firebase from 'firebase';
import { FirestoreService } from './firestore.service';

declare var FB;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private AFauth: AngularFireAuth,
    private storageService: StorageService,
    private firestoreService: FirestoreService,
  ) { }

  loginWithEmailAndPassword(email: string, password: string) {
    return this.loadAndSaveUserProfile(this.AFauth.signInWithEmailAndPassword(email, password));
  }

  loginWithSocialAccount(token: string, socialAccount: 'google.com' | 'facebook.com') {
    const credential = socialAccount === 'google.com' ?
      firebase.auth.GoogleAuthProvider.credential(token) :
      firebase.auth.FacebookAuthProvider.credential(token);
    return this.loadAndSaveUserProfile(this.AFauth.signInWithCredential(credential));
  }

  loadAndSaveUserProfile(signInPromise: Promise<firebase.auth.UserCredential>) {
    return new Promise((resolve, reject) => {
      signInPromise
        .then(userCrendential => {
          this.firestoreService.loadUserProfile(userCrendential.user.uid).then(documentSnapshot => {
            this.storageService.saveUserProfile(documentSnapshot.data().d);
            resolve(userCrendential);
          })
        })
        .catch(reason => reject(reason));
    });
  }

  getGoogleUser() {
    return GoogleAuth.signIn()
      .then(googleUser => {
        return {
          email: googleUser.email,
          name: googleUser.displayName ?? googleUser.name,
          socialAccount: 'google',
          token: googleUser.authentication.idToken,
        };
      });
  }

  getFacebookUser(): Promise<{ id?: string, email?: string, name?: string, token: string }> {
    return new Promise((resolve, reject) => {
      Plugins.FacebookLogin.login({ permissions: ['public_profile', 'email'] })
        .then(response => {
          if (response?.accessToken?.token) {
            FB.api(
              '/me',
              'GET',
              {
                fields: 'id,name,email',
                access_token: response.accessToken.token
              },
              userData => resolve({
                ...userData,
                socialAccount: 'facebook',
                token: response.accessToken.token,
              })
            );
          } else {
            reject({ token: null })
          }
        })
        .catch(() => reject({ token: null }))
    });
  }

  logout() {
    this.storageService.removeUserProfile();
    this.AFauth.currentUser.then(({ providerData }) => {
      this.AFauth.signOut();
      const providerId = providerData[0].providerId;
      if (providerId === 'facebook.com') Plugins.FacebookLogin.logout();
      if (providerId === 'google.com') GoogleAuth.signOut();
    })
  }

  checkEmail(email: string) {
    return this.AFauth.fetchSignInMethodsForEmail(email);
  }

  signUpWithEmailAndPassword(user: User, password: string) {
    return this.createAndSaveUserProfile(user, this.AFauth.createUserWithEmailAndPassword(user.email, password));
  }

  signUpWithGoogle(user: User, token: string) {
    const credential = firebase.auth.GoogleAuthProvider.credential(token);
    return this.createAndSaveUserProfile(user, this.AFauth.signInWithCredential(credential));
  }

  signUpWithFacebook(user: User, token: string) {
    const credential = firebase.auth.FacebookAuthProvider.credential(token);
    return this.createAndSaveUserProfile(user, this.AFauth.signInWithCredential(credential));
  }

  createAndSaveUserProfile(user: User, signUpPromise: Promise<firebase.auth.UserCredential>) {
    return new Promise((resolve, reject) => {
      signUpPromise
        .then(userCrendential => {
          Promise.all([
            this.storageService.saveUserProfile(user),
            this.firestoreService.createUserProfile(userCrendential.user.uid, user),
          ]).then(() => resolve());
        })
        .catch(reason => reject(reason));
    })
  }
}
