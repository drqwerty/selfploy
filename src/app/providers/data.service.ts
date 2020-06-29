import { Injectable } from '@angular/core';
import { User } from 'src/app/models/user-model';
import { TabBarState } from 'src/app/animations/tab-bar-transition'
import { StorageService } from 'src/app/services/storage.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseStorage } from 'src/app/services/firebase-storage.service';
import Utils from 'src/app/utils';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  static tabBarState: TabBarState;

  public user: User;
  public favorites: User[];
  public favoritesChangedSubject = new Subject<void>();

  constructor(
    private storage: StorageService,
    private fStorage: FirebaseStorage,
    private firestore: FirestoreService,
  ) { }

  createMyProfile(uid: string, user: User) {
    return Promise.all([
      this.firestore.createUserProfile(uid, user),
      this.storage.saveUserProfile(user),
    ]);
  }

  getUserProfile(uid: string): Promise<User> {
    return this.firestore.getUserProfile(uid);
  }

  async getMyProfile(uid?: string): Promise<User> {
    if (!this.user) {
      this.user = await this.storage.getUserProfile();
      if (!this.user) {
        this.user = await this.firestore.getUserProfile(uid);
        await this.storage.saveUserProfile(this.user);
      }
    }
    return this.user;
  }

  saveUserProfile(user: User) {
    return this.storage.saveUserProfile(user);
  }

  removeUserProfile() {
    this.storage.removeUserProfile();
  }

  updatedMyProfile(user: User) {
    return Promise.all([
      this.firestore.updateUserProfile(user),
      this.storage.saveUserProfile(user),
    ])
  }

  async updateUserLocationAccuracySetting(hideLocationAccuracy: boolean) {
    (await this.getMyProfile()).hideLocationAccuracy = hideLocationAccuracy;
    this.firestore.updateUserLocationAccuracySetting(hideLocationAccuracy);
    this.storage.saveUserProfile(this.user);
  }

  private async updateUserHasFavoritesProperty(hasFavorites: boolean) {
    if ((await this.getMyProfile()).hasFavorites !== hasFavorites) {
      (await this.getMyProfile()).hasFavorites = hasFavorites;
      this.firestore.hasFavoritesProperty(hasFavorites);
      this.storage.saveUserProfile(this.user);
    }
  }

  getUserProfilePic(uid: string) {
    return this.fStorage.getUserProfilePic(uid);
  }

  async findProfessionalOf(categoryName: string, serviceName: string) {
    return this.firestore.findProfessionalOf(categoryName, serviceName, (await this.getMyProfile()).coordinates);
  }

  async findUserByName(userName: string, categoryFilter: string) {
    return this.firestore.findUserByName(userName, categoryFilter);
  }

  async saveFavorite(user: User) {
    this.favorites = (await Promise.all([
      this.storage.saveFavorite(await this.getFavorites(), user),
      this.firestore.saveFavorite(user.id),
    ]))[0];
    this.updateUserHasFavoritesProperty(!!this.favorites.length)
    this.favoritesChangedSubject.next();
  }

  async removeFavorite(user: User) {
    this.favorites = (await Promise.all([
      this.storage.removeFavorite(await this.getFavorites(), user),
      this.firestore.removeFavorite(user.id),
    ]))[0];
    this.updateUserHasFavoritesProperty(!!this.favorites.length)
    this.favoritesChangedSubject.next();
  }

  async getFavorites(): Promise<User[]> {
    if (!(await this.getMyProfile()).hasFavorites) return [];

    if (!this.favorites) {
      this.favorites = await this.storage.getFavorites();

      if (!this.favorites) {
        this.favorites = await this.firestore.getFavorites();
        await this.storage.saveFavorites(this.favorites);
      }

      if (this.favorites) {
        const { coordinates: c1 } = await this.getMyProfile();
        this.favorites.forEach(favorite => {
          const { coordinates: c2 } = favorite;
          favorite.distance = Utils.getDistanceFromLatLonInKm(c1.lat, c1.lng, c2.lat, c2.lng);
        });
      }
    }

    return this.favorites;
  }

}
