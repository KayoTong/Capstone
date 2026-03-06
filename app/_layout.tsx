import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ensureUserDocument } from '../src/services/userService';

// --- Notification & Geofencing Imports ---
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

const GEOFENCE_TASK_NAME = 'GEOFENCE_CHECK';

// Updated Notification Handler (Fixed the TypeScript deprecation error)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // Added these to fix the "shouldShowAlert" warning in your screenshot
    shouldShowBanner: true, 
    shouldShowList: true,
  }),
});

//The Task definition
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error("Geofence Error:", error);
    return;
  }

  // Extract eventType from data
  const { eventType } = data;

  if (eventType === Location.GeofencingEventType.Exit) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Wait! Do you have your essentials?",
        body: "Check your wallet, keys, and phone before leaving.",
        data: { url: '/history' }, 
      },
      trigger: null, 
    });
  }
});

export default function RootLayout() { 
  useEffect(() => { 
    // Request Permissions on Startup
    (async () => {
      // Request Notification Permission
      const { status: authStatus } = await Notifications.requestPermissionsAsync();
      
      // Request Foreground Location
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      // Request Background Location (Required for Exit alerts when app is closed)
      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn("Background location permission denied. Geofencing will only work while app is open.");
        }
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, async (user) => { 
      if (user) {
        await ensureUserDocument(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      {/* Set headerShown to false globally to clean up the UI */}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}