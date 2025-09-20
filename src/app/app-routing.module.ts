/*
  Routing module for meteo-app, adapted from DateWate
  Authors: initappz (Rahul Jograna), licensed per https://initappz.com/license
*/
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  // {
  //   path: 'home',
  //   loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  // },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  // Rutas de DateWate comentadas, mantenidas como referencia
  /*
  {
    path: 'add-card',
    loadChildren: () => import('./pages/add-card/add-card.module').then(m => m.AddCardPageModule)
  },
  {
    path: 'all-match',
    loadChildren: () => import('./pages/all-match/all-match.module').then(m => m.AllMatchPageModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'chat-extra',
    loadChildren: () => import('./pages/chat-extra/chat-extra.module').then(m => m.ChatExtraPageModule)
  },
  {
    path: 'chats',
    loadChildren: () => import('./pages/chats/chats.module').then(m => m.ChatsPageModule)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./pages/checkout/checkout.module').then(m => m.CheckoutPageModule)
  },
  {
    path: 'country-picker',
    loadChildren: () => import('./pages/country-picker/country-picker.module').then(m => m.CountryPickerPageModule)
  },
  {
    path: 'discovery-settings',
    loadChildren: () => import('./pages/discovery-settings/discovery-settings.module').then(m => m.DiscoverySettingsPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule)
  },
  {
    path: 'fill-details',
    loadChildren: () => import('./pages/fill-details/fill-details.module').then(m => m.FillDetailsPageModule)
  },
  {
    path: 'filter',
    loadChildren: () => import('./pages/filter/filter.module').then(m => m.FilterPageModule)
  },
  {
    path: 'finger-auth',
    loadChildren: () => import('./pages/finger-auth/finger-auth.module').then(m => m.FingerAuthPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'help-centre',
    loadChildren: () => import('./pages/help-centre/help-centre.module').then(m => m.HelpCentrePageModule)
  },

  {
    path: 'inbox',
    loadChildren: () => import('./pages/inbox/inbox.module').then(m => m.InboxPageModule)
  },
  {
    path: 'interest',
    loadChildren: () => import('./pages/interest/interest.module').then(m => m.InterestPageModule)
  },
  {
    path: 'invite-friends',
    loadChildren: () => import('./pages/invite-friends/invite-friends.module').then(m => m.InviteFriendsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'maps',
    loadChildren: () => import('./pages/maps/maps.module').then(m => m.MapsPageModule)
  },
  {
    path: 'match',
    loadChildren: () => import('./pages/match/match.module').then(m => m.MatchPageModule)
  },
  {
    path: 'match-found',
    loadChildren: () => import('./pages/match-found/match-found.module').then(m => m.MatchFoundPageModule)
  },
  {
    path: 'match-ideal',
    loadChildren: () => import('./pages/match-ideal/match-ideal.module').then(m => m.MatchIdealPageModule)
  },
  {
    path: 'member-ship',
    loadChildren: () => import('./pages/member-ship/member-ship.module').then(m => m.MemberShipPageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then(m => m.NotificationsPageModule)
  },
  {
    path: 'payments',
    loadChildren: () => import('./pages/payments/payments.module').then(m => m.PaymentsPageModule)
  },
  {
    path: 'pin',
    loadChildren: () => import('./pages/pin/pin.module').then(m => m.PinPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'profile-images',
    loadChildren: () => import('./pages/profile-images/profile-images.module').then(m => m.ProfileImagesPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'security',
    loadChildren: () => import('./pages/security/security.module').then(m => m.SecurityPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsPageModule)
  },
  {
    path: 'success',
    loadChildren: () => import('./pages/success/success.module').then(m => m.SuccessPageModule)
  },
  {
    path: 'user-info',
    loadChildren: () => import('./pages/user-info/user-info.module').then(m => m.UserInfoPageModule)
  },
  {
    path: 'video-call',
    loadChildren: () => import('./pages/video-call/video-call.module').then(m => m.VideoCallPageModule)
  }
  */
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
