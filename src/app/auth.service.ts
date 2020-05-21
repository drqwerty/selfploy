import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from './user-model';
import { BehaviorSubject } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authState = new BehaviorSubject(null);

  constructor(
    private AFauth: AngularFireAuth,
    private storageService: StorageService,
  ) { }


  updateAuthState() {

    return new Promise(resolve => {
      this.storageService.getUserProfile().then(data => {
        this.authState.next(data.value != null);
        resolve(this.authState.value);
      })
    })
  }


  login(email: string, password: string): Promise<firebase.auth.UserCredential> {

    return new Promise((resolve, reject) => {
      this.AFauth.signInWithEmailAndPassword(email, password).then(value => {
        this.authState.next(true);
        resolve(value)
      }).catch(reason => reject(reason));
    })
  }


  logout() {

    this.authState.next(false);
    this.AFauth.signOut();
  }


  checkEmail(email: string) {

    return this.AFauth.fetchSignInMethodsForEmail(email);
  }


  signUp(user: User, password: string) {

    return this.AFauth.createUserWithEmailAndPassword(user.email, password);
  }


  isAuthenticated() {

    return this.authState.value;
  }
}
