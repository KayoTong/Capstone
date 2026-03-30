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
