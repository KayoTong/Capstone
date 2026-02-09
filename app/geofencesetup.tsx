import { saveGeofence } from "@/storage/geofence";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

export default function GeofenceSetup() {
  // Geofence setup screen
  const DEFAULT_RADIUS = 150;
  type MapRegion = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };

  const [region, setRegion] = useState<MapRegion | null>(null); // state to hold map region, initially null until we get user's location
  const [radius, setRadius] = useState(DEFAULT_RADIUS); // state to hold geofence radius, defaulting to 150 meters
  const [enabled, setEnabled] = useState(false); // state to track if geofencing is enabled or not

  useEffect(() => {
    // Get user's current location to center the map
    (async () => {
      const { granted } = await Location.requestForegroundPermissionsAsync(); // request location permissions
      if (!granted) return; // if permission not granted, do nothing

      const loc = await Location.getCurrentPositionAsync({}); // get current location
      setRegion({
        // set map region to user's location
        latitude: loc.coords.latitude, // set latitude to current location
        longitude: loc.coords.longitude, // set longitude to current location
        latitudeDelta: 0.01, // small delta for zoomed-in view
        longitudeDelta: 0.01, // small delta for zoomed-in view
      });
    })();
  }, []);

  async function handleSave() {
    // function to handle saving geofence configuration
    if (!region) return;

    await saveGeofence({
      //
      enabled, // save whether geofencing is enabled
      latitude: region.latitude, // save latitude from map region
      longitude: region.longitude, // save longitude from map region
      radiusMeters: radius, // save radius from state
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BeforeIGo Setup</Text>

      {/* MAP GOES HERE */}
      {region && (
        <MapView style={styles.map} initialRegion={region}>
          <Marker coordinate={region} />

          <Circle
            center={region}
            radius={radius}
            strokeColor="rgba(0,255,0,0.8)"
            fillColor="rgba(0,255,0,0.2)"
          />
        </MapView>
      )}

      {/* RADIUS SLIDER */}
      <Text style={styles.label}>Detection Radius</Text>
      <Text style={styles.radiusText}>{radius} meters</Text>

      <Slider
        minimumValue={50}
        maximumValue={500}
        step={25}
        value={radius}
        onValueChange={setRadius}
        minimumTrackTintColor="#00ff88"
        maximumTrackTintColor="#333"
      />
      {/* ENABLE TOGGLE */}
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Enable Geofencing</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>

      {/* ITEMS TO CHECK */}

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveText}>Save & Activate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f0c",
    padding: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  map: {
    height: 260,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },
  label: {
    color: "#aaa",
    marginTop: 12,
  },
  radiusText: {
    color: "#00ff88",
    fontSize: 16,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  saveButton: {
    backgroundColor: "#00ff88",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: "auto",
  },
  saveText: {
    fontWeight: "600",
  },
});
