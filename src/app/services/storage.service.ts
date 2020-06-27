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

  async getUserProfile(): Promise<User> {
    if (!this.data.user) this.data.user = await this.getData(dbKeys.user);
    return this.data.user;
  }

  async getFavorites(): Promise<User[]> {
    if (!this.data.favorites) {
      this.data.favorites = await this.getData(dbKeys.favorites) ?? [];

      const { coordinates: c1 } = await this.getUserProfile();
      this.data.favorites.forEach(favorite => {
        const { coordinates: c2 } = favorite;
        favorite.distance = Utils.getDistanceFromLatLonInKm(c1.lat, c1.lng, c2.lat, c2.lng);
      })
    }

    return this.data.favorites;
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

  async saveFavorite(user: User) {
    user.isFav = true;
    const favorites = [...await this.getFavorites()];
    if (!favorites.some(userSaved => userSaved.id === user.id)) favorites.push(user);
    favorites.sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()));
    this.data.favorites = favorites;
    return this.saveFavorites(favorites);
  }

  async removeFavorite(user: User) {
    user.isFav = false;
    const favorites = [];
    for (const userSaved of (await this.getFavorites())) if (userSaved.id !== user.id) favorites.push(userSaved);
    this.data.favorites = favorites;
    return this.saveFavorites(favorites);
  }

}
