import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Updates from 'expo-updates';

// Project Imports
import { AppNavigator } from './src/Navigation/AppNavigator';
import { ThemeProvider } from './src/Context/ThemeContext';
import { AuthService, UserProfile } from './src/Services/FirebaseAuthService';

export default function App() {
  // 1. Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Sync with Firebase Auth
  useEffect(() => {
    console.log("App: Initializing Auth Listener...");
    
    // This listener fires whenever a user logs in or out
    const unsubscribe = AuthService.onAuthStateChanged((user: UserProfile | null) => {
      if (user) {
        console.log("App: User is Authenticated:", user.email);
        setIsAuthenticated(true);
      } else {
        console.log("App: No active session found.");
        setIsAuthenticated(false);
      }
      
      // Stop showing the loading splash/spinner once we know the auth state
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // 3. Handle OTA Updates (Over-The-Air)
  useEffect(() => {
    async function onFetchUpdateAsync() {
      // Skip update checks in development mode to avoid crashes
      if (__DEV__) return;

      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            'Update Available', 
            'Smart Chalk has a new version. Restarting to apply changes...', 
            [{ text: 'Update Now', onPress: () => Updates.reloadAsync() }]
          );
        }
      } catch (error) {
        console.log("Update Error:", error);
      }
    }
    onFetchUpdateAsync();
  }, []);

  // 4. Loading State (Splash Screen)
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          {/* The AppNavigator will automatically show:
            - LoginScreen if isAuthenticated is false
            - HomeScreen if isAuthenticated is true
          */}
          <AppNavigator isAuthenticated={isAuthenticated} />
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}