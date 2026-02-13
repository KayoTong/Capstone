import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Item {
  id: string;
  name: string;
  emoji: string;
  status: "Nearby" | "Away";
}

const STORAGE_KEY = "@before_i_go_items";

// Save items to the phone's memory
export const saveItems = async (items: Item[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items");
  }
};

// Load items from the phone's memory
export const getItems = async (): Promise<Item[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};
