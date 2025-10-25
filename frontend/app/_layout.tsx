import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PermissionsManager from '../utils/PermissionsManager';
import { DialogProvider } from '../utils/DialogManager';
import { BackHandler } from 'react-native';
import { useRouter, useSegments } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // Request permissions when the app starts
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const permissions = await PermissionsManager.requestAllPermissions();
        console.log('Permissions status:', permissions);
      } catch (error) {
        console.error('Error requesting permissions:', error);
      }
    };
    
    requestPermissions();
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      const currentRoute = segments.join('/');
      
      // If we're on the root screen, exit the app
      if (currentRoute === 'index' || currentRoute === '') {
        BackHandler.exitApp();
        return true;
      }
      
      // Otherwise, go back
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DialogProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/signup" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="user" />
            <Stack.Screen name="courses" />
          </Stack>
        </DialogProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
