import { firebaseAuth } from '../Backend/FirebaseConfig';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  photo: string | null;
}

class FirebaseAuthService {
  /**
   * Main Google Login Flow (Native Implementation)
   */
  async signInWithGoogle(): Promise<UserProfile | null> {
    try {
      console.log("--- NATIVE AUTH START ---");

      // 1. Ensure Play Services are present (Android requirement)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices();
      }

      // 2. Open the native Google accounts picker
      const signInResult = await GoogleSignin.signIn();
      
      // 3. Extract the ID Token
      // Note: Compatible with both older and newer versions of the library result structure
      const idToken = signInResult.data?.idToken || (signInResult as any).idToken;

      if (!idToken) {
        console.error("Auth Error: No ID Token received from Google.");
        throw new Error('Google Sign-In failed: No ID Token');
      }

      // 4. Create Firebase Credential and Sign In
      const googleCredential = firebaseAuth.GoogleAuthProvider.credential(idToken);
      const userCredential = await firebaseAuth().signInWithCredential(googleCredential);
      
      console.log("Firebase Auth Success:", userCredential.user.email);
      return this.mapUser(userCredential.user);

    } catch (error: any) {
      this.handleNativeError(error);
      return null;
    }
  }

  getCurrentUser(): UserProfile | null {
  const user = firebaseAuth().currentUser; // Notice: NO parentheses here
  if (!user) return null;
  return this.mapUser(user);
}

  /**
   * Log out from both Firebase and Google
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      await firebaseAuth().signOut();
      console.log("User signed out from all providers.");
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  private mapUser(user: any): UserProfile {
    return {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
    };
  }

  // Inside FirebaseAuthService class
async syncUserToFirestore(profile: UserProfile, pushToken?: string) {
  try {
    const userRef = firestore().collection('users').doc(profile.id);
    await userRef.set({
      uid: profile.id,
      email: profile.email,
      name: profile.name,
      photo: profile.photo,
      pushToken: pushToken || null,
      lastLogin: firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log("Firestore Sync: Teacher profile and token updated.");
  } catch (error) {
    console.error("Firestore Sync Error:", error);
  }
}

  /**
   * Handles Native Status Codes
   */
  private handleNativeError(error: any) {
    console.log('Native Auth Error:', error.code, error.message);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("User dismissed the login prompt.");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("An operation is already in progress.");
    } else if (error.code === '10' || error.message?.includes('DEVELOPER_ERROR')) {
      // This is the specific error you were facing
      Alert.alert(
        'Configuration Error (10)',
        'Your SHA-1 fingerprint or Web Client ID is mismatched in Firebase. Ensure the google-services.json matches your EAS build.'
      );
    } else {
      Alert.alert('Login Error', error.message || 'Something went wrong. Please try again.');
    }
  }

  /**
   * Auth state listener for App.tsx
   */
  onAuthStateChanged(callback: (user: UserProfile | null) => void) {
    return firebaseAuth().onAuthStateChanged((user) => {
      callback(user ? this.mapUser(user) : null);
    });
  }
}

export const AuthService = new FirebaseAuthService();