import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.valdeolmos.meteoapp',
  appName: 'meteo-app',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
