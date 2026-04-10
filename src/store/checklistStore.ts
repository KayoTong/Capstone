import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig";

export type ChecklistItem = {
  id: string;
  name: string;
  photoUri: string;
  active: boolean;
  lastChecked?: string; // Automatically stores the date/time verified
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
  getItems: () => items,

  // NEW: Get the saved geofence coordinates
  getHomeLocation: () => {
    return {
      latitude: homeLatitude,
      longitude: homeLongitude,
    };
  },

  // NEW: Set and save geofence coordinates
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
        notifyListeners();
      } else {
        items = [];
        homeLatitude = null;
        homeLongitude = null;
        notifyListeners();
      }
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

  addItem: async (name: string, photoUri: string) => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      name,
      photoUri,
      active: true,
    };
    items.push(newItem);
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
