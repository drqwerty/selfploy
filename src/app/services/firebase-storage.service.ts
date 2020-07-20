import { Injectable } from '@angular/core';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { dbKeys } from '../models/db-keys';
import * as moment from 'moment';

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


  async uploadRequestImageList(imageList: { [key: string]: string }[], requestId: string) {
    const metadata = { contentType: 'image/jpeg' };

    const imageNameList = await this.getNameListFromFireStorage(requestId);
    const conservedImageNameList = [];

    await Promise.all([
      imageList.map(async ({ name, url: image }) => {

        if (image.startsWith('data:image')) {
          image = image.replace(/^data:image\/(png|jpeg);base64,/, '');
          await firebase.storage()
            .ref(`${dbKeys.requests}/${requestId}/${requestId}-${name}.jpg`)
            .putString(image, 'base64', metadata);

        } else { // url
          conservedImageNameList.push(name);
        }
      })
    ]);

    const imageNameDeletedList = imageNameList.filter(name => !conservedImageNameList.includes(name));
    this.removeImages(requestId, imageNameDeletedList);
  }


  async uploadImageToConversation(image: string, conversationId: string) {
    const metadata = { contentType: 'image/jpeg' };
    const name = moment().unix().toString();
    image = image.replace(/^data:image\/(png|jpeg);base64,/, '');

    const uploadTask = await firebase.storage()
      .ref(`${dbKeys.conversations}/${conversationId}/${name}.jpg`)
      .putString(image, 'base64', metadata);

    const url = await uploadTask.ref.getDownloadURL();
    return url;
  }


  async getNameListFromFireStorage(requestId) {
    const storageRef = firebase.storage().ref(`${dbKeys.requests}/${requestId}`);
    const names = (await storageRef.listAll()).items.map(item => item.name);
    return names;
  }


  removeImages(requestId: string, imageNameList: string[]) {
    imageNameList
      .forEach(name => firebase.storage().ref(`${dbKeys.requests}/${requestId}/${name}`).delete());
  }


  async getRequestImages(requestId: string) {
    const storageRef = firebase.storage().ref(`${dbKeys.requests}/${requestId}`);
    const { items } = await storageRef.listAll();
    const imageList = await Promise.all(items.map(async imageRef => {
      const url = await imageRef.getDownloadURL();
      const name = imageRef.name;
      return { name, url };
    }));
    return imageList;
  }


  async deleteRequestImages(requestId: string) {
    const folderRef = firebase.storage().ref(`${dbKeys.requests}/${requestId}`);
    const deleteImagesPromises = (await folderRef.listAll()).items.map(async item => await item.delete());
    await Promise.all(deleteImagesPromises);
  }


}
