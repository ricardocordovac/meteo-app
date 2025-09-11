// import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { provideClientHydration } from '@angular/platform-browser';
// import { provideServiceWorker } from '@angular/service-worker';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     provideClientHydration(),
//     //descomentar para que sea pwa
//     // provideServiceWorker('ngsw-worker.js', {
//     //   enabled: !isDevMode(),
//     //   registrationStrategy: 'registerWhenStable:30000'
//     // })
//   ]
// };
// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
