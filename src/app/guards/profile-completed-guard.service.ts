import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { DataService } from 'src/app/providers/data.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileCompletedGuardService implements CanActivate {

  constructor(
    private router: Router,
    private data: DataService,
    ) { }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.data.getMyProfile().then(user => {
      if (user.profileCompleted) return true;
      this.router.navigateByUrl('tabs/profile/edit');
      return false;
    })
  }
}
