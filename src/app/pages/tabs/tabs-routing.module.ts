/*
  Tabs routing module for meteo-app, adapted from DateWate
  Authors: initappz (Rahul Jograna), licensed per https://initappz.com/license
*/
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      // Rutas de DateWate comentadas
      /*
      {
        path: 'maps',
        loadChildren: () => import('../maps/maps.module').then(m => m.MapsPageModule)
      },
      {
        path: 'match',
        loadChildren: () => import('../match/match.module').then(m => m.MatchPageModule)
      },
      {
        path: 'chats',
        loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      }
      */
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}
