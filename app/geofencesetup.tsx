import { getGeofence, saveGeofence } from "@/storage/geofence";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import * as Location from "expo-location";
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import { updateGeofenceSettings } from "../src/services/userService";
import { styles } from "../src/styles/geofencesetup.styles";

export default function GeofenceSetup() {
  const router = useRouter();
  const DEFAULT_RADIUS = 150;
  const GEOFENCE_TASK_NAME = "GEOFENCE_CHECK"; // Matches the task name in _layout.tsx

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
  const [isSaving, setIsSaving] = useState(false);

  // Function to snap map to wherever the phone (or Fake GPS) is right now
  async function handleRecenter() {
    try {
      setLoading(true);
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const newRegion = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      console.log(
        "Map updated to current GPS:",
        newRegion.latitude,
        newRegion.longitude,
      );
    } catch (error) {
      Alert.alert("Error", "Could not refresh location.");
    } finally {
      setLoading(false);
    }
  }

  // COMBINED INITIALIZATION: Loads storage first, then GPS if no storage exists.
  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);

        // 1. Get Location Permissions
        const { granted } = await Location.requestForegroundPermissionsAsync();
        if (!granted) {
          Alert.alert("Permission Denied", "Location access is needed.");
          setLoading(false);
          return;
        }

        // 2. Load Saved Settings (AsyncStorage)
        const saved = await getGeofence();

        if (saved) {
          setEnabled(saved.enabled);
          setRadius(saved.radiusMeters || DEFAULT_RADIUS);
          if (saved.latitude && saved.longitude) {
            setRegion({
              latitude: saved.latitude,
              longitude: saved.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
        }

        // 3. If no saved region, fetch live GPS automatically
        if (!saved || !saved.latitude) {
          await handleRecenter();
        }
      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setLoading(false);
      }
    }
    initialize();
  }, []);

  useEffect(() => {
    // Print UID for verification
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) console.log("UID:", user.uid);
    });
    return unsubscribe;
  }, []);

  async function handleSave() {
    if (!region || isSaving) return;
    const user = auth.currentUser;
    setIsSaving(true);

    try {
      if (user) {
        // 1. Firebase update
        await updateGeofenceSettings(
          user.uid,
          region.latitude,
          region.longitude,
          radius,
        );

        // 2. Local storage update
        await saveGeofence({
          enabled: enabled,
          latitude: region.latitude,
          longitude: region.longitude,
          radiusMeters: radius,
        });

        // 3. Register/Unregister the actual Background Geofence
        if (enabled) {
          await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, [
            {
              identifier: "HomeZone",
              latitude: region.latitude,
              longitude: region.longitude,
              radius: radius,
              notifyOnExit: true,
              notifyOnEnter: false,
            },
          ]);
          console.log(
            "LOG: Geofencing Started at:",
            region.latitude,
            region.longitude,
          );
        } else {
          await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME);
          console.log("LOG: Geofencing Stopped.");
        }

        router.replace("/home" as any);
      } else {
        Alert.alert("Error", "User not authenticated.");
        setIsSaving(false);
      }
    } catch (e) {
      Alert.alert("Error", "Failed to save geofence.");
      console.error("Save Error:", e);
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={[styles.container, { backgroundColor: "#6B7A74" }]}>
        <View style={{ flex: 1, paddingHorizontal: 20 }}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.title}>BeforeIGo Setup</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#00ff88" />
              <Text style={{ color: "#aaa", marginTop: 10 }}>
                Updating Location...
              </Text>
            </View>
          ) : region ? (
            <View
              style={{
                height: 300,
                borderRadius: 15,
                overflow: "hidden",
                marginBottom: 20,
              }}
            >
              <MapView
                style={{ flex: 1 }}
                initialRegion={region}
                region={region}
                showsUserLocation={true} // Shows blue dot for current location
                toolbarEnabled={true} // Restores Google Maps "Directions" & "Open in Maps" buttons
              >
                <Marker coordinate={region} />
                <Circle
                  center={region}
                  radius={radius}
                  strokeColor="rgba(0,255,0,0.8)"
                  fillColor="rgba(0,255,0,0.2)"
                />
              </MapView>

              {/* Pin to GPS Button - Top Right position to avoid overlapping Google Tools */}
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  backgroundColor: "rgba(34, 34, 34, 0.9)",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#444",
                }}
                onPress={handleRecenter}
              >
                <Ionicons name="locate" size={18} color="#00ff88" />
                <Text
                  style={{
                    color: "white",
                    marginLeft: 6,
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  Pin to GPS
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

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
              <Text style={{ color: "#95a5a6", fontSize: 12 }}>
                Alert when leaving this area
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: "#333", true: "#00ff88" }}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.8 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.saveText}>Save & Activate</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}
