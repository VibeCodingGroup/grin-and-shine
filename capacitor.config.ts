import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.052e67177f684c429e9997ad176e2542',
  appName: 'grin-and-shine',
  webDir: 'dist',
  server: {
    url: 'https://052e6717-7f68-4c42-9e99-97ad176e2542.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;