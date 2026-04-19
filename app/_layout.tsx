import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef } from "react";
import "react-native-reanimated";
import { auth } from "../firebaseConfig";
import { ensureUserDocument } from "../src/services/userService";
import { ThemeProvider } from "../src/services/themeService";

// --- Notification & Geofencing Imports ---
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import { GEOFENCE_TASK_NAME } from "../src/services/locationService";
import {
  ACTION_CONFIRM_SAFE,
  ACTION_NAVIGATE_HOME,
  DEFAULT_ESSENTIALS,
  LEAVE_CHECK_BODY,
  LEAVE_CHECK_CATEGORY_ID,
  LEAVE_CHECK_TITLE,
  buildLeaveCheckData,
  getStringValue,
} from "../src/services/notificationService";

// i deleted the previous constants and helper functions and moved them to src/services/notificationService.ts as part of the march 29th refactor to make the notification logic more modular and reusable across the app (Andy)

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

      await Notifications.setNotificationCategoryAsync(
        LEAVE_CHECK_CATEGORY_ID,
        [
          {
            identifier: ACTION_CONFIRM_SAFE,
            buttonTitle: "Confirm Safe",
            options: {
              opensAppToForeground: true,
            },
          },
          {
            identifier: ACTION_NAVIGATE_HOME,
            buttonTitle: "Navigate Home",
            options: {
              opensAppToForeground: true,
            },
          },
        ],
      );

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("leave-checks", {
          name: "Leave Checks",
          importance: Notifications.AndroidImportance.HIGH,
          sound: "default",
        });
      }

      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus === "granted") {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== "granted") {
          console.warn(
            "Background location permission denied. Geofencing will only work while app is open.",
          );
        }
      }
    }

    configureAppExperience().catch((error) => {
      console.error("Startup configuration failed:", error);
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
        source: getStringValue(data.source) ?? "geofence-exit",
        action:
          response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER
            ? "open"
            : response.actionIdentifier,
        triggeredAt:
          getStringValue(data.triggeredAt) ?? new Date().toISOString(),
      };

      router.push({
        pathname: "/leave-check" as any,
        params,
      });
    }

    const subscription =
      Notifications.addNotificationResponseReceivedListener(openLeaveCheck);

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response) {
          openLeaveCheck(response);
        }
      })
      .catch((error) => {
        console.error("Failed to read last notification response:", error);
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
    <ThemeProvider>
      {/* Set headerShown to false globally to clean up the UI */}
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
