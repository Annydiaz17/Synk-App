import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.synkapp.todo',
  appName: 'Synk App',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0F172A',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#00D4C8',
    }
  }
};

export default config;
