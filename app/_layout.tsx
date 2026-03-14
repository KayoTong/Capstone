import { checklistStore } from '@/src/store/checklistStore';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { ensureUserDocument } from '../src/services/userService';

// --- Notification & Geofencing Imports ---
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const GEOFENCE_TASK_NAME = 'GEOFENCE_CHECK';
const LEAVE_CHECK_CATEGORY_ID = 'beforeigo-leave-check';
const ACTION_CONFIRM_SAFE = 'beforeigo-confirm-safe';
const ACTION_NAVIGATE_HOME = 'beforeigo-navigate-home';
const DEFAULT_ESSENTIALS = ['Wallet', 'Keys', 'Phone'];
const LEAVE_CHECK_TITLE = 'Before you go — quick essentials check';
const LEAVE_CHECK_BODY = 'We think a few important items may still be inside.';

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

function getNotificationItemNames() {
  const trackedItems = checklistStore
    .getItems()
    .filter((item) => item.active)
    .map((item) => item.name.trim())
    .filter(Boolean)
    .slice(0, 3);

  return trackedItems.length > 0 ? trackedItems : DEFAULT_ESSENTIALS;
}

function buildLeaveCheckData(action?: string) {
  return {
    screen: '/leave-check',
    title: LEAVE_CHECK_TITLE,
    body: LEAVE_CHECK_BODY,
    items: JSON.stringify(getNotificationItemNames()),
    source: 'geofence-exit',
    action,
    triggeredAt: new Date().toISOString(),
  };
}

function getStringValue(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return undefined;
}

//The Task definition
TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error("Geofence Error:", error);
    return;
  }

  // Extract eventType from data
  const eventType = data?.eventType;

  if (eventType === Location.GeofencingEventType.Exit) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: LEAVE_CHECK_TITLE,
        body: LEAVE_CHECK_BODY,
        categoryIdentifier: LEAVE_CHECK_CATEGORY_ID,
        data: buildLeaveCheckData(),
      },
      trigger: null, 
    });
  }
});

export default function RootLayout() { 
  const router = useRouter();
  const handledNotificationIds = useRef<Set<string>>(new Set());

  useEffect(() => { 
    async function configureAppExperience() {
      await Notifications.requestPermissionsAsync();

      await Notifications.setNotificationCategoryAsync(LEAVE_CHECK_CATEGORY_ID, [
        {
          identifier: ACTION_CONFIRM_SAFE,
          buttonTitle: 'Confirm Safe',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: ACTION_NAVIGATE_HOME,
          buttonTitle: 'Navigate Home',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('leave-checks', {
          name: 'Leave Checks',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
        });
      }

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus === 'granted') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.warn("Background location permission denied. Geofencing will only work while app is open.");
        }
      }
    }

    configureAppExperience().catch((error) => {
      console.error('Startup configuration failed:', error);
    });
  }, []);

  useEffect(() => {
    function openLeaveCheck(response: Notifications.NotificationResponse) {
      const notificationId = response.notification.request.identifier;

      if (handledNotificationIds.current.has(notificationId)) {
        return;
      }

      handledNotificationIds.current.add(notificationId);

      const data = response.notification.request.content.data ?? {};
      const params = {
        title: getStringValue(data.title) ?? LEAVE_CHECK_TITLE,
        body: getStringValue(data.body) ?? LEAVE_CHECK_BODY,
        items: getStringValue(data.items) ?? JSON.stringify(DEFAULT_ESSENTIALS),
        source: getStringValue(data.source) ?? 'geofence-exit',
        action:
          response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
            ? 'open'
            : response.actionIdentifier,
        triggeredAt: getStringValue(data.triggeredAt) ?? new Date().toISOString(),
      };

      router.push({
        pathname: '/leave-check' as any,
        params,
      });
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(openLeaveCheck);

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          openLeaveCheck(response);
        }
      })
      .catch((error) => {
        console.error('Failed to read last notification response:', error);
      });

    return () => {
      subscription.remove();
    };
  }, [router]);

  useEffect(() => {
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
