import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ArenAI',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      visible: false,
      style: 'DARK',
      overlaysWebView: true,
    },
  },
  // Deep link handling configuration
  server: {
    androidScheme: 'https',
  },
};

export default config;
