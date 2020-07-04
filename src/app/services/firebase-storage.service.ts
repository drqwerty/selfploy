import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { dbKeys } from '../models/db-keys';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorage {

  constructor(
    private aFAuth: AngularFireAuth
  ) { }

  async getUserProfilePic(userUID: string) {
    let url: string;

    try {
      url = await firebase.storage().ref(`${dbKeys.profilePics}/${userUID}.jpg`).getDownloadURL();
    } catch { }

    return url;
  }

  async uploadUserProfilePic(imageBase64: string, userUID?: string) {
    if (!userUID) userUID = (await this.aFAuth.currentUser).uid;
    imageBase64 = imageBase64.replace(/^data:image\/(png|jpeg);base64,/, '');
    const metadata = { contentType: 'image/jpeg' };
    await firebase.storage().ref(`${dbKeys.profilePics}/${userUID}.jpg`).putString(imageBase64, 'base64', metadata);
  }

  async uploadRequestImages(imageBase64Array: string[], requestId: string) {
    const metadata = { contentType: 'image/jpeg' };
    await Promise.all([
      imageBase64Array.map(async (imageBase64, index) => {
        imageBase64 = imageBase64.replace(/^data:image\/(png|jpeg);base64,/, '');
        await firebase.storage()
          .ref(`${dbKeys.requests}/${requestId}/${requestId}-${index + 1}.jpg`)
          .putString(imageBase64, 'base64', metadata);
      })
    ])
  }

  async getRequestImages(requestId: string) {
    const storageRef = firebase.storage().ref(`${dbKeys.requests}/${requestId}`);
    const { items } = (await storageRef.listAll());
    const urlList = await Promise.all(items.map(async imageRef => await imageRef.getDownloadURL() as string));
    return urlList;
  }

}
