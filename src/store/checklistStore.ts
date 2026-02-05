// Checklist state store.

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
  
  addItem: (name: string, photoUri: string) => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      name,
      photoUri,
      active: true,
    };
    items.push(newItem);
    notifyListeners();
  },
  
  removeItem: (id: string) => {
    items = items.filter((item) => item.id !== id);
    notifyListeners();
  },
  
  toggleItem: (id: string) => {
    items = items.map((item) =>
      item.id === id ? { ...item, active: !item.active } : item
    );
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
