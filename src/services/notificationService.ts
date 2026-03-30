// Notification service interface and helpers.
// I am refactoring this to be more of a "service" that can be used across the app,
// rather than being tightly coupled to the checklist logic. This way, if we want to add other types of

import { checklistStore } from "../store/checklistStore";

// notifications in the future, we can reuse this service (Andy)
export const LEAVE_CHECK_CATEGORY_ID = "beforeigo-leave-check"; // step 1 of tonights march 29th refactor: move all notification related constants to this file so they are in one place and easier to manage. (Andy)
export const ACTION_CONFIRM_SAFE = "beforeigo-confirm-safe";
export const ACTION_NAVIGATE_HOME = "beforeigo-navigate-home";
export const DEFAULT_ESSENTIALS = ["Wallet", "Keys", "Phone"];
export const LEAVE_CHECK_TITLE = "Before you go — quick essentials check";
export const LEAVE_CHECK_BODY =
  "We think a few important items may still be inside.";

export function getNotificationItemNames() {
  // i am moving this function from _layout.tsx to here so that it can be used by other notification types in the future, not just the leave check. This is part of the march 29th refactor to make the notification logic more modular and reusable across the app (Andy)
  const trackedItems = checklistStore
    .getItems()
    .filter((item) => item.active)
    .map((item) => item.name.trim())
    .filter(Boolean)
    .slice(0, 3);

  return trackedItems.length > 0 ? trackedItems : DEFAULT_ESSENTIALS;
}

export function buildLeaveCheckData(action?: string) {
  // i am moving this function here (andy)
  return {
    screen: "/leave-check",
    title: LEAVE_CHECK_TITLE,
    body: LEAVE_CHECK_BODY,
    items: JSON.stringify(getNotificationItemNames()),
    source: "geofence-exit",
    action,
    triggeredAt: new Date().toISOString(),
  };
}

export function getStringValue(value: unknown) {
  // this is a helper function to safely extract string values from the notification response data. I added this because I was running into some issues with the types of the data coming back from the notification response, and this function helps ensure that we are working with strings when we expect to be. This is part of the march 29th refactor to improve the robustness of our notification handling logic (Andy)
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
}

// leave-check related constants and helper functions. I moved these from _layout.tsx as part of the march 29th refactor to make the notification logic more modular and reusable across the app (Andy)
export function getFirstParam(value: string | string[] | undefined) {
  // moved from leave-check.tsx (andy)
  // Utility function to handle query parameters that may be provided as either a single string or an array of strings, ensuring we always work with a single value.
  return Array.isArray(value) ? value[0] : value;
}

export function parseItemsParam(itemsParam: string | string[] | undefined) {
  // moved from leave-check.tsx (Andy)
  // Parses the 'items' query parameter, which is expected to be a JSON-encoded array of strings. It includes validation and sanitization to ensure we end up with a clean array of item names to display.
  const rawItems = getFirstParam(itemsParam);

  if (!rawItems) {
    // If no items are provided, return the fallback list.
    return DEFAULT_ESSENTIALS;
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

  return DEFAULT_ESSENTIALS; // We will use default essentials instead of fallback_items to prevent duplicate logic (Andy)
}

export function getTriggeredLabel(source: string | undefined) {
  // moved from leave-check.tsx
  // Provides a user-friendly label describing the source of the leave-home alert based on the 'source' query parameter. This helps users understand why they are seeing the alert and can provide context for the reminder.
  if (source === "geofence-exit") {
    return "Triggered as you exited your home zone.";
  }

  return "Triggered from your latest safety reminder.";
}

export function formatTriggeredAt(triggeredAt: string | undefined) {
  // moved from leave-check.tsx (Andy)
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
