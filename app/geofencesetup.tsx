import { saveGeofence } from "@/storage/geofence";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useRouter } from 'expo-router'; 
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps"; // 

export default function GeofenceSetup() { // Main setup screen for geofence configuration
  const router = useRouter(); 
  const DEFAULT_RADIUS = 150;
  
  type MapRegion = { // Type for map region state
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };

  const [region, setRegion] = useState<MapRegion | null>(null); // User's current location for map centering
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync(); // Request location permissions
        if (!granted) {
          Alert.alert("Permission Denied", "Location access is needed for geofencing.");
          setLoading(false);
          return;
        }

        // Fast fetch using last known position
        let loc = await Location.getLastKnownPositionAsync({});

        // Fallback to live GPS if cache is empty
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        if (loc) {
          setRegion({ // Center map on user's location
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        Alert.alert("Location Error", "Could not determine your current position. Ensure GPS is on.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() { // Save geofence settings
    if (!region) return; // Safety check
    try {
      await saveGeofence({
        enabled,
        latitude: region.latitude,
        longitude: region.longitude,
        radiusMeters: radius,
      });

      // REDIRECT: Go straight to the white Main Homepage (home.tsx)
      router.replace("/home" as any); 
      
    } catch (e) {
      Alert.alert("Error", "Failed to save geofence.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeforeIGo Setup</Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#00ff88" />
          <Text style={{ color: "#aaa", marginTop: 10 }}>Locating your home...</Text>
        </View>
      ) : region ? (
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} />
          <Circle
            center={region}
            radius={radius}
            strokeColor="rgba(0,255,0,0.8)"
            fillColor="rgba(0,255,0,0.2)"
          />
        </MapView>
      ) : (
        <View style={styles.loadingBox}>
          <Text style={{ color: "#ff6b6b" }}>Map unavailable. Check GPS.</Text>
        </View>
      )}

      <Text style={styles.label}>Detection Radius</Text>
      <Text style={styles.radiusText}>{radius} meters</Text>

      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={50}
        maximumValue={500}
        step={25}
        value={radius}
        onValueChange={setRadius}
        minimumTrackTintColor="#00ff88"
        maximumTrackTintColor="#333"
        thumbTintColor="#00ff88"
      />

      <View style={styles.toggleRow}>
        <View>
          <Text style={styles.label}>Enable Geofencing</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>Alert when leaving this area</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{ false: "#333", true: "#00ff88" }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>Save & Activate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0c", padding: 16, paddingTop: 50 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  map: { height: 300, borderRadius: 20, marginBottom: 16 },
  loadingBox: { height: 300, justifyContent: "center", alignItems: "center", backgroundColor: "#111", borderRadius: 20, marginBottom: 16 },
  label: { color: "#fff", fontSize: 16, fontWeight: "500" },
  radiusText: { color: "#00ff88", fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20, borderTopWidth: 1, borderTopColor: "#222" },
  saveButton: { backgroundColor: "#00ff88", padding: 18, borderRadius: 30, alignItems: "center", marginTop: "auto", marginBottom: 20 },
  saveText: { fontWeight: "bold", fontSize: 18, color: "#0b0f0c" },
});