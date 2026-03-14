import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {  Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../src/styles/leave-check.styles";

const FALLBACK_ITEMS = ['Wallet', 'Keys', 'Phone']; // Default items to show if no valid items are provided via query params.
const CONFIRM_SAFE_ACTION = 'beforeigo-confirm-safe'; //  Action identifier for confirming safety, used to determine initial state and button behavior.
const NAVIGATE_HOME_ACTION = 'beforeigo-navigate-home';

type LeaveCheckParams = { // Define the expected query parameters for the leave check screen.
  title?: string | string[];
  body?: string | string[];
  items?: string | string[];
  source?: string | string[];
  action?: string | string[];
  triggeredAt?: string | string[];
};

function getFirstParam(value: string | string[] | undefined) { // Utility function to handle query parameters that may be provided as either a single string or an array of strings, ensuring we always work with a single value.
  return Array.isArray(value) ? value[0] : value;
}

function parseItemsParam(itemsParam: string | string[] | undefined) { // Parses the 'items' query parameter, which is expected to be a JSON-encoded array of strings. It includes validation and sanitization to ensure we end up with a clean array of item names to display.
  const rawItems = getFirstParam(itemsParam);

  if (!rawItems) { // If no items are provided, return the fallback list.
    return FALLBACK_ITEMS;
  }

  try { // Attempt to parse the raw items string as JSON. If it's not valid JSON or doesn't conform to the expected structure, we'll catch the error and return the fallback items.
    const parsed = JSON.parse(rawItems);
    if (Array.isArray(parsed)) { // We expect the parsed value to be an array. If it's not, we'll ignore it and use the fallback items.
      const cleaned = parsed
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 3);

      if (cleaned.length > 0) {
        return cleaned;
      }
    }
  } catch {
    // Ignore malformed params and fall back to defaults.
  }

  return FALLBACK_ITEMS; 
}

function getChipIcon(itemName: string) { // Determines which icon to display for a given item name by checking for specific keywords. This allows us to show more relevant icons for common items like wallets, keys, phones, and bags, while defaulting to a generic icon for anything else.
  const normalized = itemName.toLowerCase();

  if (normalized.includes('wallet')) {
    return 'wallet-outline';
  }

  if (normalized.includes('key')) {
    return 'key-outline';
  }

  if (normalized.includes('phone')) {
    return 'phone-portrait-outline';
  }

  if (normalized.includes('bag')) {
    return 'briefcase-outline';
  }

  return 'cube-outline';
}

function getTriggeredLabel(source: string | undefined) { // Provides a user-friendly label describing the source of the leave-home alert based on the 'source' query parameter. This helps users understand why they are seeing the alert and can provide context for the reminder.
  if (source === 'geofence-exit') {
    return 'Triggered as you exited your home zone.';
  }

  return 'Triggered from your latest safety reminder.';
}

function formatTriggeredAt(triggeredAt: string | undefined) { // Takes the 'triggeredAt' query parameter, which is expected to be a timestamp string, and formats it into a more human-readable time format. If the parameter is missing or invalid, it returns undefined, allowing the UI to conditionally display the time if it's available.
  if (!triggeredAt) {
    return undefined;
  }

  const parsedDate = new Date(triggeredAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toLocaleTimeString([], { // Format the time in a way that's appropriate for the user's locale, showing only the hour and minute for simplicity.
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function LeaveCheckScreen() { // The main component for the leave check screen. It uses query parameters to customize the content and behavior of the screen, allowing for a dynamic and context-aware user experience. The screen includes a title, body text, a list of items to check, and actions for confirming safety or navigating home.
  const router = useRouter();
  const params = useLocalSearchParams<LeaveCheckParams>();
  const action = getFirstParam(params.action);
  const title = getFirstParam(params.title) ?? 'Before you go';
  const body =
    getFirstParam(params.body) ??
    'We think a few important items may still be inside.';
  const source = getFirstParam(params.source);
  const items = parseItemsParam(params.items);
  const triggeredTime = formatTriggeredAt(getFirstParam(params.triggeredAt));
  const [confirmed, setConfirmed] = useState(action === CONFIRM_SAFE_ACTION);

  useEffect(() => {
    setConfirmed(action === CONFIRM_SAFE_ACTION);
  }, [action]);

  function handleConfirmSafe() { // When the user confirms they are safe, we set the confirmed state to true, which updates the UI to reflect that the safety check has been completed. We also set a timeout to automatically navigate the user back to the home screen after a short delay, giving them feedback that their confirmation was successful before taking them back.
    setConfirmed(true);

    setTimeout(() => {
      router.replace('/home');
    }, 500);
  }

  function handleNavigateHome() { // When the user chooses to navigate home, we immediately take them back to the home screen. This allows users who may have triggered the alert by mistake or who want to quickly dismiss it to get back to their main app experience without going through the confirmation process.
    router.replace('/home');
  }

  const supportingCopy = confirmed
    ? 'Safe confirmed. Your leave-home reminder has been cleared.'
    : body;

  const actionHint =
    action === NAVIGATE_HOME_ACTION
      ? 'Quick action selected: Navigate Home'
      : action === CONFIRM_SAFE_ACTION
        ? 'Quick action selected: Confirm Safe'
        : undefined;

  return ( // The UI is designed to be visually engaging and easy to understand, with clear calls to action and contextual information about why the user is seeing the alert. The use of icons, colors, and layout all work together to create a cohesive experience that encourages users to take a moment to check for their essentials before leaving home.
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <StatusBar style="light" />

      <SafeAreaView style={styles.screen}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNavigateHome}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={20} color="#E7FFF2" />
          </TouchableOpacity>

          <View style={styles.headerPill}>
            <View style={styles.headerPillDot} />
            <Text style={styles.headerPillText}>Leave-home alert</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <View style={styles.iconCore}>
              <Ionicons name="shield-checkmark-outline" size={26} color="#03170F" />
            </View>
          </View>

          <Text style={styles.brandLabel}>BeforeIGo</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{supportingCopy}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="navigate-circle-outline" size={16} color="#89D7A7" />
            <Text style={styles.metaText}>
              {getTriggeredLabel(source)}
              {triggeredTime ? ` ${triggeredTime}` : ''}
            </Text>
          </View>

          {actionHint ? <Text style={styles.actionHint}>{actionHint}</Text> : null}

          <View style={styles.chipsRow}>
            {items.map((item) => (
              <View key={item} style={styles.chip}>
                <Ionicons name={getChipIcon(item)} size={16} color="#9BFFC3" />
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Quick essentials pass</Text>
          <Text style={styles.sectionCopy}>
            Take one last look before you leave. A fast check now prevents the
            expensive walk back.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleConfirmSafe}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {confirmed ? 'Confirmed' : 'Confirm Safe'}
            </Text>
            <Ionicons
              name={confirmed ? 'checkmark-circle' : 'arrow-forward-circle'}
              size={20}
              color="#03170F"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNavigateHome}
            style={styles.secondaryButton}
          >
            <Ionicons name="home-outline" size={18} color="#D8FBE7" />
            <Text style={styles.secondaryButtonText}>Navigate Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
