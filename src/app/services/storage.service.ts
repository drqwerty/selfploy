import { Injectable } from '@angular/core';
import { User } from '../models/user-model';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  saveUserProfile(user: any) {
    return Storage.set({
      key: 'user',
      value: JSON.stringify(Object.assign({}, user))
    })
  }

  getUserProfile() {
    return Storage.get({ key: 'user' });
  }

  removeUserProfile() {
    return Storage.remove({ key: 'user' })
  }
}
