import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfessionalListPage } from './professional-list.page';

const routes: Routes = [
  {
    path: '',
    component: ProfessionalListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfessionalListPageRoutingModule {}
