import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User, UserRole } from '../models/user-model';

import "@codetrix-studio/capacitor-google-auth";
import { Plugins } from '@capacitor/core';
const { GoogleAuth } = Plugins;
import * as firebase from 'firebase/app';
import { DataService } from '../providers/data.service';
import Utils from "src/app/utils";


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
    private aFAuth: AngularFireAuth,
    private data: DataService,
  ) { }

  loginWithEmailAndPassword(email: string, password: string) {
    return this.loadAndSaveUserProfile(this.aFAuth.signInWithEmailAndPassword(email, password));
  }

  loginWithSocialAccount(token: string, socialAccount: 'google.com' | 'facebook.com') {
    const credential = socialAccount === 'google.com' ?
      firebase.auth.GoogleAuthProvider.credential(token) :
      firebase.auth.FacebookAuthProvider.credential(token);
    return this.loadAndSaveUserProfile(this.aFAuth.signInWithCredential(credential));
  }

  async loadAndSaveUserProfile(signInPromise: Promise<firebase.auth.UserCredential>) {
    try {
      const userCrendential = await signInPromise;
      const user = await this.data.getMyProfile(userCrendential.user.uid)
      if (user.hasProfilePic) user.profilePic = await this.data.getUserProfilePic(userCrendential.user.uid);
      await this.data.getFavorites();
      await this.data.getRequests();
      await this.data.saveUserProfile(user);
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
    this.aFAuth.currentUser.then(({ providerData }) => {
      this.aFAuth.signOut();
      this.data.removeUserProfile();
      const providerId = providerData[0].providerId;
      if (providerId === 'facebook.com') Plugins.FacebookLogin.logout();
      if (providerId === 'google.com') GoogleAuth.signOut();
    })
  }

  checkEmail(email: string) {
    return this.aFAuth.fetchSignInMethodsForEmail(email);
  }

  signUpWithEmailAndPassword(user: User, password: string) {
    return this.createAndSaveUserProfile(user, this.aFAuth.createUserWithEmailAndPassword(user.email, password));
  }

  signUpWithGoogle(user: User, token: string) {
    const credential = firebase.auth.GoogleAuthProvider.credential(token);
    return this.createAndSaveUserProfile(user, this.aFAuth.signInWithCredential(credential));
  }

  signUpWithFacebook(user: User, token: string) {
    const credential = firebase.auth.FacebookAuthProvider.credential(token);
    return this.createAndSaveUserProfile(user, this.aFAuth.signInWithCredential(credential));
  }

  createAndSaveUserProfile(user: User, signUpPromise: Promise<firebase.auth.UserCredential>) {
    if (user.role === UserRole.professional) user.professionalProfileActivated = true;
    user.name_splited = Utils.normalizeAndSplit(user.name);

    return new Promise((resolve, reject) => {
      signUpPromise
        .then(async userCrendential => {
          await this.data.createMyProfile(userCrendential.user.uid, user);
          resolve();
        })
        .catch(reason => reject(reason));
    })
  }
}
