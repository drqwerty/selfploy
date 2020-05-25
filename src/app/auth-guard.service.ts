import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(
    private router: Router,
    private AFAuth: AngularFireAuth) { }

  canActivate(route: ActivatedRouteSnapshot) {

    return this.AFAuth.currentUser.then(authenticated => {

      if (authenticated) return true;

      this.router.navigateByUrl('main');
      return false;
    })
  }
}
