import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletedGuardService implements CanActivate {

  constructor(
    private router: Router,
    private storage: StorageService,
    ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.storage.getUserProfile().then(user => {
      if (user.profileCompleted) return true;
      this.router.navigateByUrl('tabs/profile/edit');
      return false;
    })
  }
}
