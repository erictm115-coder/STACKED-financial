import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Stacked',
  slug: 'Stacked',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'stacked',
  userInterfaceStyle: 'dark',
  ios: {
    icon: './assets/expo.icon',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
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
  },
});
