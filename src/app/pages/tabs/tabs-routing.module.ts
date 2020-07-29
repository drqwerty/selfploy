import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';
import { ProfileCompletedGuardService } from 'src/app/guards/profile-completed-guard.service';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: 'categories' },
      {
        path: 'categories',
        loadChildren: () => import('../categories/categories.module').then(m => m.CategoriesPageModule),
        canActivate: [ProfileCompletedGuardService],
      },
      {
        path: 'request-list',
        loadChildren: () => import('../request-list/request-list.module').then(m => m.RequestListPageModule),
        canActivate: [ProfileCompletedGuardService],
      },
      {
        path: 'favorites',
        loadChildren: () => import('../favorites/favorites.module').then(m => m.FavoritesPageModule),
        canActivate: [ProfileCompletedGuardService],
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [ProfileCompletedGuardService],
      },
      {
        path: 'profile/edit',
        loadChildren: () => import('../profile-edit/profile-edit.module').then(m => m.ProfileEditPageModule),
      },
      {
        path: 'profile/settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule),
        canActivate: [ProfileCompletedGuardService],
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
