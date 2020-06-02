import { Injectable } from '@angular/core';
import { User } from '../models/user-model';

import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async saveUserProfile(user: User) {
    const { token, ...essentialUserData } = user;
    return Storage.set({
      key: 'user',
      value: JSON.stringify(Object.assign({}, essentialUserData))
    })
  }

  async getUserProfile(): Promise<User> {
    const user = await Storage.get({ key: 'user' });
    return JSON.parse(user.value);
  }

  removeUserProfile() {
    return Storage.remove({ key: 'user' })
  }
}
