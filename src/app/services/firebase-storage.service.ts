import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

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
      url = await firebase.storage().ref(`profilePics/${userUID}.jpg`).getDownloadURL();
    } catch { }

    return url;
  }

  async uploadUserProfilePic(imageBase64: string, userUID?: string) {
    if (!userUID) userUID = (await this.aFAuth.currentUser).uid;
    imageBase64 = imageBase64.replace(/^data:image\/(png|jpeg);base64,/, '');
    const metadata = { contentType: 'image/jpeg' };
    await firebase.storage().ref(`profilePics/${userUID}.jpg`).putString(imageBase64, 'base64', metadata);
  }

}
