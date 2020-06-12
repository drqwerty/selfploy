import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User, UserRole } from '../models/user-model';
import { StorageService } from './storage.service';

import "@codetrix-studio/capacitor-google-auth";
import { Plugins } from '@capacitor/core';
const { GoogleAuth } = Plugins;
import * as firebase from 'firebase/app';
import { FirestoreService } from './firestore.service';
import { FirebaseStorage } from './firebase-storage.service';

declare var FB;

const fromURLtoBase64 = (url: string) =>
  fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    }))
    .catch(() => url)

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private AFauth: AngularFireAuth,
    private storageService: StorageService,
    private firestoreService: FirestoreService,
    private fStorage: FirebaseStorage,
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

  async loadAndSaveUserProfile(signInPromise: Promise<firebase.auth.UserCredential>) {
    try {
      const userCrendential = await signInPromise;
      const user = await this.firestoreService.getUserProfile(userCrendential.user.uid);
      if (user.hasProfilePic) user.profilePic = await this.fStorage.getUserProfilePic(userCrendential.user.uid);
      await this.storageService.saveUserProfile(user);
      return userCrendential;
    } catch (reason) {
      throw new Error(reason);
    }
  }

  getGoogleUser() {
    return GoogleAuth.signIn()
      .then(async googleUser => {
        const imageUrl = googleUser.imageUrl.substring(0, googleUser.imageUrl.lastIndexOf('=')) + '=s320';
        const profilePic = await fromURLtoBase64(imageUrl);
        // const profilePic = imageUrl;
        return {
          email: googleUser.email,
          name: googleUser.displayName ?? googleUser.name,
          profilePic,
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
                fields: 'id,name,email,picture.width(320).height(320)',
                access_token: response.accessToken.token,
              },
              async userData => {
                const { picture, ...user } = userData;
                const profilePic = await fromURLtoBase64(picture.data.url);
                resolve({
                  ...user,
                  profilePic,
                  socialAccount: 'facebook',
                  token: response.accessToken.token,
                })
              }
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
    user.profileCompleted = user.role === UserRole.client;
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
