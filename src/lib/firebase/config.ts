/**
 * Firebase web app config (project "credisimulator", site "creditsimulator").
 *
 * The web API key is read from the build environment (VITE_FIREBASE_API_KEY: .env.local
 * locally, the FIREBASE_WEB_API_KEY secret in GitHub Actions) so it is not stored in the
 * repository. It still ends up in the built JavaScript, as for every Firebase web app:
 * access is protected by the Firestore rules and the key's HTTP-referrer restrictions.
 * Without a key, analytics and short links are off and the app uses long share links.
 */
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

export const firebaseConfig = apiKey
  ? {
      apiKey,
      authDomain: 'credisimulator.firebaseapp.com',
      projectId: 'credisimulator',
      storageBucket: 'credisimulator.firebasestorage.app',
      messagingSenderId: '359821051195',
      appId: '1:359821051195:web:5722267d1dca1eafe9e31e',
      measurementId: 'G-HPYXNLX87L',
    }
  : null;
