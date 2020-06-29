import { Injectable } from '@angular/core';
import { User } from '../models/user-model';
import * as _ from 'lodash';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { dbKeys } from 'src/app/providers/data.service'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  async getUserProfile(): Promise<User> {
    return this.getData(dbKeys.user);
  }

  async getFavorites(): Promise<User[]> {
    return this.getData(dbKeys.favorites);
  }

  private async getData(key: string) {
    return JSON.parse((await Storage.get({ key })).value);
  }

  saveUserProfile(user: User) {
    const { token, ...essentialUserData } = user;
    _.forEach(essentialUserData, (value, key) => { if (value === null) delete essentialUserData[key]; });
    return this.saveData(dbKeys.user, Object.assign({}, essentialUserData))
  }

  saveFavorites(favorites: User[]) {
    return this.saveData(dbKeys.favorites, favorites)
  }

  private saveData(key: string, data: any) {
    return Storage.set({ key, value: JSON.stringify(data) });
  }

  removeUserProfile() {
    return Storage.remove({ key: dbKeys.user })
  }

  async saveFavorite(favoritesI: User[], user: User) {
    user.isFav = true;
    const favorites = [...favoritesI];
    if (!favorites.some(userSaved => userSaved.id === user.id)) favorites.push(user);
    favorites.sort((a, b) => a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase()));
    await this.saveFavorites(favorites);
    return favorites;
  }

  async removeFavorite(favoritesI: User[], user: User) {
    user.isFav = false;
    const favorites = [];
    for (const userSaved of favoritesI) if (userSaved.id !== user.id) favorites.push(userSaved);
    await this.saveFavorites(favorites);
    return favorites;
  }

}
