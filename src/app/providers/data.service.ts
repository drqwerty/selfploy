import { Injectable } from '@angular/core';
import { User } from '../models/user-model';
import { TabBarState } from '../animations/tab-bar-transition'

@Injectable({
  providedIn: 'root'
})
export class DataService {

  static tabBarState: TabBarState;

  public user: User;
  public favorites: User[];

  constructor() { }
}
