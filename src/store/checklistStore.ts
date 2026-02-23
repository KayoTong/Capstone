import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChecklistItem = {
  id: string;
  name: string;
  photoUri: string;
  active: boolean;
};

let items: ChecklistItem[] = [];
let listeners: (() => void)[] = [];

export const checklistStore = {
  getItems: () => items,
  
  // Load data from phone storage
  loadFromDisk: async () => {
    try {
      const data = await AsyncStorage.getItem('beforeigo_items');
      if (data) {
        items = JSON.parse(data);
        notifyListeners();
      }
    } catch (e) {
      console.error("Failed to load items", e);
    }
  },

  // Save data to phone storage
  saveToDisk: async () => {
    try {
      await AsyncStorage.setItem('beforeigo_items', JSON.stringify(items));
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
    await checklistStore.saveToDisk(); // Auto-save
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
};

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};