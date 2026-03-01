import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../../firebaseConfig';

export type ChecklistItem = {
  id: string;
  name: string;
  photoUri: string;
  active: boolean;
};

// helper to derive storage key for current user (or anonymous)
function getKey(uid?: string) {
  const id = uid || auth.currentUser?.uid || 'anon';
  return `beforeigo_items_${id}`;
}

let items: ChecklistItem[] = [];
let listeners: (() => void)[] = [];

export const checklistStore = {
  getItems: () => items,
  
  // Load data from phone storage for a specific user (current auth by default)
  loadFromDisk: async (uid?: string) => {
    try {
      const key = getKey(uid);
      const data = await AsyncStorage.getItem(key);
      if (data) {
        items = JSON.parse(data);
        notifyListeners();
      } else {
        // no data for this user yet -> reset
        items = [];
        notifyListeners();
      }
    } catch (e) {
      console.error("Failed to load items", e);
    }
  },

  // Save data to phone storage for the current user
  saveToDisk: async (uid?: string) => {
    try {
      const key = getKey(uid);
      await AsyncStorage.setItem(key, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save items", e);
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
    await checklistStore.saveToDisk(); // Auto-save for current user
    notifyListeners();
  },
  
  removeItem: async (id: string) => {
    items = items.filter((item) => item.id !== id);
    await checklistStore.saveToDisk(); // Auto-save
    notifyListeners();
  },

  // NEW: Update item name
  updateItem: async (id: string, newName: string) => {
    items = items.map((item) =>
      item.id === id ? { ...item, name: newName } : item
    );
    await checklistStore.saveToDisk(); // Auto-save
    notifyListeners();
  },
  
  toggleItem: async (id: string) => {
    items = items.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item
    );
    await checklistStore.saveToDisk(); // Auto-save
    notifyListeners();
  },
  
  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  // clear in-memory and disk data for current user (useful on logout)
  clear: async (uid?: string) => {
    items = [];
    notifyListeners();
    try {
      const key = getKey(uid);
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to clear items', e);
    }
  },
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};