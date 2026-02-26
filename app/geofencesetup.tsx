import { saveGeofence } from "@/storage/geofence";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { Stack, useRouter } from 'expo-router'; // Added Stack
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../src/styles/geofencesetup.styles";

export default function GeofenceSetup() {
  const router = useRouter();
  const DEFAULT_RADIUS = 150;

  type MapRegion = {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };

  const [region, setRegion] = useState<MapRegion | null>(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (!granted) {
          Alert.alert("Permission Denied", "Location access is needed for geofencing.");
          setLoading(false);
          return;
        }

        let loc = await Location.getLastKnownPositionAsync({});
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        if (loc) {
          setRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        Alert.alert("Location Error", "Could not determine your current position.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    if (!region) return;
    try {
      await saveGeofence({
        enabled,
        latitude: region.latitude,
        longitude: region.longitude,
        radiusMeters: radius,
      });

      router.replace("/home" as any);
    } catch (e) {
      Alert.alert("Error", "Failed to save geofence.");
    }
  }

  return (
    <>
      {/* This removes the white header bar */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* SafeAreaView ensures content stays below the status bar/notch */}
      <SafeAreaView style={[styles.container, { backgroundColor: '#000' }]}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>BeforeIGo Setup</Text>
          </View>

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
      </SafeAreaView>
    </>
  );
}