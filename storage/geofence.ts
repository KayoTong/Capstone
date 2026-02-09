import AsyncStorage from "@react-native-async-storage/async-storage";
import { GeofenceConfig } from "@/types/Geofence";


const KEY = "beforeigo_geofence"; // storage key for geofence configuration

export async function saveGeofence(config: GeofenceConfig) { // save geofence configuration
  await AsyncStorage.setItem(KEY, JSON.stringify(config)); // store as JSON string
}

export async function getGeofence(): Promise<GeofenceConfig | null> { // retrieve geofence configuration
  const raw = await AsyncStorage.getItem(KEY); // get stored JSON string
  return raw ? JSON.parse(raw) : null; // parse and return as object or null
}


  // navigate back or show success
