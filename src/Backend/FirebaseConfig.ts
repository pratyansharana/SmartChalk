import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// The Native SDK reads from google-services.json automatically.
// We only need to configure Google Sign-In with your Web Client ID.
export const WEB_CLIENT_ID = "539935145898-9tcrfedprj150hnjovqoha5jfhna6b2l.apps.googleusercontent.com";

if (!WEB_CLIENT_ID) {
  console.error("Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in .env file");
}

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
});

// Export the Native Auth module to be used by your Service Layer
export const firebaseAuth = auth;