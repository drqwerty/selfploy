import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from './user-model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  constructor(
    private AFauth: AngularFireAuth
  ) { }


  login(email: string, password: string) {

    return this.AFauth.signInWithEmailAndPassword(email, password);
  }


  checkEmail(email: string) {

    return this.AFauth.fetchSignInMethodsForEmail(email);
  }


  signUp(user: User, password: string) {

    return this.AFauth.createUserWithEmailAndPassword(user.email, password);
  }
}
