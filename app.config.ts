import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Stacked',
  slug: 'Stacked',
  version: '1.0.0',
  jsEngine: 'hermes',
  orientation: 'portrait',
  icon: './assets/images/appicon.png',
  scheme: 'stacked',
  userInterfaceStyle: 'dark',
  ios: {
    icon: './assets/images/appicon.png',
    bundleIdentifier: 'com.erictm2626.stacked',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0d0d0d',
      foregroundImage: './assets/images/appicon.png',
    },
    predictiveBackGestureEnabled: false,
    package: 'com.erictm2626.stacked',
  },
  web: {
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-dev-client',
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0d0d0d',
        android: {
          image: './assets/images/splash-icon.png',
          imageWidth: 76,
        },
      },
    ],
    'expo-notifications',
    'expo-asset',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    // The anon/publishable key is safe to ship client-side — it's designed
    // for that, and access is gated by Postgres RLS policies, not secrecy.
    // Never put the Resend (or any server-only) key here.
    supabaseUrl: process.env.SUPABASE_URL ?? 'https://cmmbakbxxbjonzmcklkr.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? 'sb_publishable_OfeWpLXeVVKMDjqVHE0DqQ_eR--bpV7',
    eas: {
      projectId: '3703d635-48dd-4912-9ae6-4e917eda5421',
    },
  },
});
