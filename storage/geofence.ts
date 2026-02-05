import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeofenceConfig } from "@/types/Geofence";

const KEY = "beforeigo_geofence";

export async function saveGeofence(config: GeofenceConfig) {
  await AsyncStorage.setItem(KEY, JSON.stringify(config));
}

export async function getGeofence(): Promise<GeofenceConfig | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
