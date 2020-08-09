import { Injectable } from '@angular/core';
import { User, UserConfig } from 'src/app/models/user-model';
import * as _ from 'lodash';
import { Plugins } from '@capacitor/core';
const { Storage } = Plugins;
import { dbKeys } from 'src/app/models/db-keys'
import { Request, RequestListConfig } from 'src/app/models/request-model';

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


  async getData(key: string) {
    return JSON.parse((await Storage.get({ key })).value);
  }


  saveUserProfile(user: User) {
    const { token, ...essentialUserData } = user;
    _.forEach(essentialUserData, (value, key) => { if (value === null) delete essentialUserData[key]; });
    return this.saveData(dbKeys.user, Object.assign({}, essentialUserData))
  }


  saveFavorites(favorites: User[]) {
    if (!favorites.length) return this.removeKeys(dbKeys.favorites);
    return this.saveData(dbKeys.favorites, favorites)
  }


  private saveData(key: string, data: any) {
    return Storage.set({ key, value: JSON.stringify(data) });
  }


  private removeKeys(...keys) {
    return keys.forEach(key => Storage.remove({ key }));
  }


  removeUserProfile() {
    return Storage.clear();
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


  getMyRequestList(): Promise<Request[]> {
    return this.getData(dbKeys.requests);
  }


  getRequestFollowingList(): Promise<Request[]> {
    return this.getData(dbKeys.requestsFollowing);
  }


  /* requests */


  saveRequests(requests: Request[], dbKey: dbKeys.requests | dbKeys.requestsFollowing) {
    if (!requests) return this.removeKeys(dbKey);
    return this.saveData(dbKey, requests)
  }


  async saveRequest(requestsI: Request[], request: Request) {
    const requests = [...requestsI];
    if (!requests.some(requestSaved => requestSaved.id === request.id)) requests.push(request);
    await this.saveRequests(requests, request.isMine ? dbKeys.requests : dbKeys.requestsFollowing);
    return requests;
  }


  async updateRequest(requests: Request[], request: Request) {
    const index = requests.findIndex(requestI => request.id == requestI.id);
    if (index > -1) requests[index] = request;
    else requests.push(request);

    await this.saveRequests(requests, request.isMine ? dbKeys.requests : dbKeys.requestsFollowing)
    return requests;
  }


  async removeRequest(requestsI: Request[], request: Request) {
    const requests = [];
    for (const requestSaved of requestsI) if (requestSaved.id !== request.id) requests.push(requestSaved);
    await this.saveRequests(requests, request.isMine ? dbKeys.requests : dbKeys.requestsFollowing);
    return requests;
  }


  /* messages */


  async saveConversations(conversations) {
    return this.saveData(dbKeys.conversations, conversations);
  }


  getConversations() {
    return this.getData(dbKeys.conversations);
  }


  /* user config */

  async createUserConfig() {
    const defaultConfig: UserConfig = {
      requestListOptions: {
        showCompleted: RequestListConfig.hide,
        showDraft: RequestListConfig.show,
        orderBy: RequestListConfig.orderByDate,
        order: RequestListConfig.ascendingOrder,
      }
    }
    await this.saveData(dbKeys.userConfig, defaultConfig);
    return defaultConfig;
  }


  getUserConfig(): Promise<UserConfig> {
    return this.getData(dbKeys.userConfig);
  }


  async updateUserConfig(newConfig: UserConfig) {
    await this.saveData(dbKeys.userConfig, newConfig)
  }

}
