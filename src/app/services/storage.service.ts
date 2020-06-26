import { Injectable } from '@angular/core';
import { User } from '../models/user-model';
import * as _ from 'lodash';

import { Plugins } from '@capacitor/core';
import { DataService } from '../providers/data.service';
import Utils from "src/app/utils";

const { Storage } = Plugins;

enum dbKeys {
  user = 'user',
  favorites = 'favorites',
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(
    private data: DataService,
  ) { }

  getUserProfile(): Promise<User> {
    return this.getData(dbKeys.user);
  }

  async getFavorites(): Promise<User[]> {
    const favorites: User[] = await this.getData(dbKeys.favorites);

    const { coordinates: c1 } = this.data.user ?? await this.getUserProfile();
    favorites.forEach(favorite => {
      const { coordinates: c2 } = favorite;
      favorite.distance = Utils.getDistanceFromLatLonInKm(c1.lat, c1.lng, c2.lat, c2.lng);
    })

    return favorites;
  }

  async getData(key: string) {
    return JSON.parse((await Storage.get({ key })).value);
  }

  saveUserProfile(user: User) {
    const { token, ...essentialUserData } = user;
    _.forEach(essentialUserData, (value, key) => { if (value === null) delete essentialUserData[key]; });
    return this.saveData(dbKeys.user, Object.assign({}, essentialUserData))
  }

  saveFavorites(favorites: User[]) {
    this.saveData(dbKeys.favorites, favorites)
  }

  saveData(key: string, data: any) {
    return Storage.set({ key, value: JSON.stringify(data) });
  }

  removeUserProfile() {
    return Storage.remove({ key: dbKeys.user })
  }

}
