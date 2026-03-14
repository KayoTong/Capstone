import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { checklistStore } from "../src/store/checklistStore";
import { styles } from "../src/styles/leave-check.styles";

const FALLBACK_ITEMS = ["Wallet", "Keys", "Phone"]; // Default items to show if no valid items are provided via query params.
const CONFIRM_SAFE_ACTION = "beforeigo-confirm-safe"; //  Action identifier for confirming safety, used to determine initial state and button behavior.
const NAVIGATE_HOME_ACTION = "beforeigo-navigate-home";

type LeaveCheckParams = {
  // Define the expected query parameters for the leave check screen.
  title?: string | string[];
  body?: string | string[];
  items?: string | string[];
  source?: string | string[];
  action?: string | string[];
  triggeredAt?: string | string[];
  /* These receive the dynamic coordinates from the pin you set on the map */
  homeLat?: string;
  homeLng?: string;
};

function getFirstParam(value: string | string[] | undefined) {
  // Utility function to handle query parameters that may be provided as either a single string or an array of strings, ensuring we always work with a single value.
  return Array.isArray(value) ? value[0] : value;
}

function parseItemsParam(itemsParam: string | string[] | undefined) {
  // Parses the 'items' query parameter, which is expected to be a JSON-encoded array of strings. It includes validation and sanitization to ensure we end up with a clean array of item names to display.
  const rawItems = getFirstParam(itemsParam);

  if (!rawItems) {
    // If no items are provided, return the fallback list.
    return FALLBACK_ITEMS;
  }

  try {
    // Attempt to parse the raw items string as JSON. If it's not valid JSON or doesn't conform to the expected structure, we'll catch the error and return the fallback items.
    const parsed = JSON.parse(rawItems);
    if (Array.isArray(parsed)) {
      // We expect the parsed value to be an array. If it's not, we'll ignore it and use the fallback items.
      const cleaned = parsed
        .filter((item): item is string => typeof item === "string")
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

function getChipIcon(itemName: string) {
  // Determines which icon to display for a given item name by checking for specific keywords. This allows us to show more relevant icons for common items like wallets, keys, phones, and bags, while defaulting to a generic icon for anything else.
  const normalized = itemName.toLowerCase();

  if (normalized.includes("wallet")) {
    return "wallet-outline";
  }

  if (normalized.includes("key")) {
    return "key-outline";
  }

  if (normalized.includes("phone")) {
    return "phone-portrait-outline";
  }

  if (normalized.includes("bag")) {
    return "briefcase-outline";
  }

  return "cube-outline";
}

function getTriggeredLabel(source: string | undefined) {
  // Provides a user-friendly label describing the source of the leave-home alert based on the 'source' query parameter. This helps users understand why they are seeing the alert and can provide context for the reminder.
  if (source === "geofence-exit") {
    return "Triggered as you exited your home zone.";
  }

  return "Triggered from your latest safety reminder.";
}

function formatTriggeredAt(triggeredAt: string | undefined) {
  // Takes the 'triggeredAt' query parameter, which is expected to be a timestamp string, and formats it into a more human-readable time format. If the parameter is missing or invalid, it returns undefined, allowing the UI to conditionally display the time if it's available.
  if (!triggeredAt) {
    return undefined;
  }

  const parsedDate = new Date(triggeredAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toLocaleTimeString([], {
    // Format the time in a way that's appropriate for the user's locale, showing only the hour and minute for simplicity.
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function LeaveCheckScreen() {
  // The main component for the leave check screen. It uses query parameters to customize the content and behavior of the screen, allowing for a dynamic and context-aware user experience. The screen includes a title, body text, a list of items to check, and actions for confirming safety or navigating home.
  const router = useRouter();
  const params = useLocalSearchParams<LeaveCheckParams>();

  /* REAL-TIME LOGIC: Local state to force re-render when the store changes */
  const [storeItems, setStoreItems] = useState(checklistStore.getItems());
  const [confirmed, setConfirmed] = useState(
    getFirstParam(params.action) === CONFIRM_SAFE_ACTION,
  );

  /* LOGIC: Local tracking to bypass disk latency for immediate UI updates */
  const [localVerified, setLocalVerified] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to store changes so the UI updates in real-time
    const unsubscribe = checklistStore.subscribe(() => {
      setStoreItems([...checklistStore.getItems()]);
    });
    return () => unsubscribe();
  }, []);

  const title = getFirstParam(params.title) ?? "Before you go";
  const body =
    getFirstParam(params.body) ??
    "We think a few important items may still be inside.";
  const source = getFirstParam(params.source);
  const itemsFromParams = parseItemsParam(params.items);
  const triggeredTime = formatTriggeredAt(getFirstParam(params.triggeredAt));

  function handleConfirmSafe() {
    // When the user confirms they are safe, we set the confirmed state to true, generate a precise timestamp for the history log, and navigate the user to the History page.
    setConfirmed(true);
    const newlyVerified: string[] = [];

    /* LOGIC: Update each item in the checklist store to trigger the 'Verified' state and timestamp */
    itemsFromParams.forEach((itemName) => {
      const match = storeItems.find(
        (si) => si.name.toLowerCase() === itemName.toLowerCase(),
      );
      if (match) {
        newlyVerified.push(itemName.toLowerCase());
        checklistStore.updateLastChecked(match.id);
      }
    });

    setLocalVerified(newlyVerified);

    setTimeout(() => {
      // Navigating to History so the user sees their items updated to "Verified" with the new timestamp.
      router.replace("/history");
    }, 1500);
  }

  function handleNavigateHome() {
    // When the user chooses to navigate home, we trigger a Google Maps deep link to get directions back to the dynamic home geofence coordinates.
    /* DYNAMIC LOGIC: 
        We pull the exact coordinates from the URL parameters. 
        If they are missing, we query the 'Home' label in the Map app, 
        ensuring it never defaults to a random city hall or park.
    */
    const lat = getFirstParam(params.homeLat);
    const lon = getFirstParam(params.homeLng);
    const label = encodeURIComponent("Home");

    const url = Platform.select({
      ios: lat && lon ? `maps:0,0?q=${label}@${lat},${lon}` : `maps:0,0?q=Home`, // Dynamic fallback
      android:
        lat && lon
          ? `google.navigation:q=${lat},${lon}`
          : `google.navigation:q=Home`, // Dynamic fallback
    });

    if (url) {
      Linking.openURL(url).catch(() => router.replace("/home"));
    }
  }

  const supportingCopy = confirmed
    ? "Safe confirmed. Your leave-home reminder has been cleared."
    : body;

  const actionHint =
    getFirstParam(params.action) === NAVIGATE_HOME_ACTION
      ? "Quick action selected: Navigate Home"
      : getFirstParam(params.action) === CONFIRM_SAFE_ACTION
        ? "Quick action selected: Confirm Safe"
        : undefined;

  return (
    // The UI is designed to be visually engaging and easy to understand, with clear calls to action and contextual information about why the user is seeing the alert. The use of icons, colors, and layout all work together to create a cohesive experience that encourages users to take a moment to check for their essentials before leaving home.
    <View style={{ flex: 1, backgroundColor: "#03170F" }}>
      <Stack.Screen
        options={{
          headerShown: false,
          presentation: "transparentModal", // Changed to transparentModal to help with layout
          animation: "slide_from_bottom",
        }}
      />
      <StatusBar style="light" />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Added ScrollView to prevent buttons from being cut off on smaller screens or when the item list grows */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.screen, { flex: 1 }]}>
            <View style={styles.glowTop} />
            <View style={styles.glowBottom} />

            <View style={styles.headerRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.replace("/home")}
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
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={26}
                    color="#03170F"
                  />
                </View>
              </View>

              <Text style={styles.brandLabel}>BeforeIGo</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.body}>{supportingCopy}</Text>

              <View style={styles.metaRow}>
                <Ionicons
                  name="navigate-circle-outline"
                  size={16}
                  color="#89D7A7"
                />
                <Text style={styles.metaText}>
                  {getTriggeredLabel(source)}
                  {triggeredTime ? ` ${triggeredTime}` : ""}
                </Text>
              </View>

              {actionHint ? (
                <Text style={styles.actionHint}>{actionHint}</Text>
              ) : null}

              <View style={styles.chipsRow}>
                {itemsFromParams.map((itemName) => {
                  /* Logic: Match the item name with the store to get the real photoUri */
                  const match = storeItems.find(
                    (si) => si.name.toLowerCase() === itemName.toLowerCase(),
                  );

                  /* Logic: Check if this specific item was just verified in this session */
                  const isVerified =
                    confirmed || localVerified.includes(itemName.toLowerCase());

                  return (
                    /* The chip transitions to a larger verifiedCard style once confirmed is true, matching the History page model */
                    <View
                      key={itemName}
                      style={isVerified ? styles.verifiedCard : styles.chip}
                    >
                      {/* Once confirmed, we transition from a generic icon to the circular profile container for the item's photo */}
                      <View
                        style={
                          isVerified
                            ? styles.circleProfile
                            : styles.iconWrapSmall
                        }
                      >
                        {isVerified && match?.photoUri ? (
                          <Image
                            source={{ uri: match.photoUri }}
                            style={{ width: "100%", height: "100%" }}
                          />
                        ) : (
                          <Ionicons
                            name={getChipIcon(itemName)}
                            size={isVerified ? 20 : 16}
                            color="#9BFFC3"
                          />
                        )}
                      </View>
                      <View
                        style={isVerified ? styles.verifiedTextContent : null}
                      >
                        <Text
                          style={
                            isVerified
                              ? styles.verifiedItemName
                              : styles.chipText
                          }
                        >
                          {itemName}
                        </Text>
                        {isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={10}
                              color="#4ADE80"
                            />
                            <Text style={styles.verifiedBadgeText}>
                              Verified
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Quick essentials pass</Text>
              <Text style={styles.sectionCopy}>
                Take one last look before you leave. A fast check now prevents
                the expensive walk back.
              </Text>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirmSafe}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {confirmed ? "Confirmed" : "Confirm Safe"}
                </Text>
                <Ionicons
                  name={confirmed ? "checkmark-circle" : "arrow-forward-circle"}
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
