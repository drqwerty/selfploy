import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { User } from './user-model';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  
  constructor(
    private AFauth: AngularFireAuth,
    private firestoreService: FirestoreService
  ) { }

  login(email: string, password: string) {

    return this.AFauth.signInWithEmailAndPassword(email, password);
  }


  checkEmail(email: string) {

    return this.AFauth.fetchSignInMethodsForEmail(email);
  }


  signUp(user: User, pass: string) {

    return this.AFauth.createUserWithEmailAndPassword(user.email, pass)
      .then(userCredential => {
        this.firestoreService.setUser(userCredential.user.uid, user);
      });
  }
}
