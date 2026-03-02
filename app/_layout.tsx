import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ensureUserDocument } from '../src/services/userService';

export default function RootLayout() { 
  useEffect(() => { // this will automatically create a user document in Firestore for any authenticated user, which is necessary for storing geofence data and other user-specific information in the future
    const unsubscribe = onAuthStateChanged(auth, async (user) => { // i set up an automatic uid creator for firestore
      if (user) {
        await ensureUserDocument(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Stack />
      <StatusBar style="auto" />
    </>
  );
}
