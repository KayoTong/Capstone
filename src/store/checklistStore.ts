import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig";

export type Category =
  | "Essentials"
  | "Tech"
  | "Extra Layers"
  | "Toiletries"
  | "Other";

export type ChecklistItem = {
  id: string;
  name: string;
  photoUri: string;
  active: boolean;
  category: Category; // NEW
  isCritical: boolean; // NEW: For high-priority escalation logic
  lastChecked?: string;
};

// helper to derive storage key for current user (or anonymous)
function getKey(uid?: string) {
  const id = uid || auth.currentUser?.uid || "anon";
  return `beforeigo_items_${id}`;
}

// Memory storage
let items: ChecklistItem[] = [];
let homeLatitude: number | null = null;
let homeLongitude: number | null = null;
let listeners: (() => void)[] = [];

export const checklistStore = {
  // FIXED: Returning a spread copy ensures React sees a fresh reference
  getItems: () => [...items],

  // Get the saved geofence coordinates
  getHomeLocation: () => {
    return {
      latitude: homeLatitude,
      longitude: homeLongitude,
    };
  },

  // Set and save geofence coordinates
  setHomeLocation: async (lat: number, lon: number) => {
    homeLatitude = lat;
    homeLongitude = lon;
    await checklistStore.saveToDisk();
    notifyListeners();
  },

  // Load data from phone storage for a specific user
  loadFromDisk: async (uid?: string) => {
    try {
      const key = getKey(uid);
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data);
        items = parsed.items || [];
        homeLatitude = parsed.homeLatitude || null;
        homeLongitude = parsed.homeLongitude || null;
      } else {
        items = [];
        homeLatitude = null;
        homeLongitude = null;
      }
      notifyListeners();
    } catch (e) {
      console.error("Failed to load data", e);
    }
  },

  // Save data to phone storage for the current user
  saveToDisk: async (uid?: string) => {
    try {
      const key = getKey(uid);
      const dataToSave = JSON.stringify({
        items,
        homeLatitude,
        homeLongitude,
      });
      await AsyncStorage.setItem(key, dataToSave);
    } catch (e) {
      console.error("Failed to save data", e);
    }
  },

  // UPDATED: Accepts category and critical status
  addItem: async (
    name: string,
    photoUri: string,
    category: Category = "Other",
    isCritical: boolean = false,
  ) => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      name,
      photoUri,
      active: true,
      category,
      isCritical,
    };
    
    // FIXED: Spread existing items + new item to trigger React re-renders
    items = [...items, newItem];
    
    await checklistStore.saveToDisk();
    notifyListeners();
  },

  removeItem: async (id: string) => {
    items = items.filter((item) => item.id !== id);
    await checklistStore.saveToDisk();
    notifyListeners();
  },

  updateItem: async (id: string, newName: string) => {
    items = items.map((item) =>
      item.id === id ? { ...item, name: newName } : item,
    );
    await checklistStore.saveToDisk();
    notifyListeners();
  },

  updateLastChecked: async (id: string) => {
    const now = new Date();
    const timestamp = now.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    items = items.map((item) =>
      item.id === id ? { ...item, lastChecked: timestamp } : item,
    );

    await checklistStore.saveToDisk();
    notifyListeners();
  },

  toggleItem: async (id: string) => {
    items = items.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item,
    );
    await checklistStore.saveToDisk();
    notifyListeners();
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  clear: async (uid?: string) => {
    items = [];
    homeLatitude = null;
    homeLongitude = null;
    notifyListeners();
    try {
      const key = getKey(uid);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Failed to clear data", e);
    }
  },
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};