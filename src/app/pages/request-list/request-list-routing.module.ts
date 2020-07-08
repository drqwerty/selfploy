import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RequestListPage } from './request-list.page';
import { ProfileCompletedGuardService } from 'src/app/guards/profile-completed-guard.service';

const routes: Routes = [
  {
    path: '',
    component: RequestListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RequestListPageRoutingModule {}
