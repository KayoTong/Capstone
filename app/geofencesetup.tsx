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
import {
  buildGeofenceConfig,
  buildGeofenceRegion,
  buildMapRegion,
  DEFAULT_GEOFENCE_RADIUS,
  GEOFENCE_RADIUS_STEP,
  GEOFENCE_TASK_NAME,
  MAX_GEOFENCE_RADIUS,
  MIN_GEOFENCE_RADIUS,
  normalizeSavedGeofenceConfig,
  shouldFetchCurrentLocation,
  type MapRegion,
} from "../src/services/locationService";
import { updateGeofenceSettings } from "../src/services/userService";
import { styles } from "../src/styles/geofencesetup.styles";

export default function GeofenceSetup() {
  const router = useRouter();

  const [region, setRegion] = useState<MapRegion | null>(null);
  const [radius, setRadius] = useState(DEFAULT_GEOFENCE_RADIUS);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Function to snap map to wherever the phone (or Fake GPS) is right now
  async function handleRecenter() {
    try {
      setLoading(true); // Sets the loading state to true to show a visual indicator (like a spinner) while the app fetches the location.
      const loc = await Location.getCurrentPositionAsync({
        // This line requests the phone's current GPS coordinates (latitude and longitude) one time.
        accuracy: Location.Accuracy.Balanced, // Balanced accuracy provides a reliable location for the map without draining the phone's battery as much as "High" accuracy would.
      });
      const newRegion = buildMapRegion(
        loc.coords.latitude,
        loc.coords.longitude,
      ); //Creates a new region object that centers the amp to the phone's current location using latitude and longitude while keeping the app zoomed into a small area (0.01 delta). Higher numbers such as 0.1 would show a larger zoom area.
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
        const { granted } = await Location.requestForegroundPermissionsAsync(); // Calls expo's location api to request foreground location permission while the app is open
        if (!granted) {
          //If user denies location permission, we sent an alert message that pops up in the app
          Alert.alert("Permission Denied", "Location access is needed.");
          setLoading(false); //The app stops loading because permission wasn't granted, so we don't want to keep showing the loading spinner indefinitely
          return; //Exit the function early so no further location logic runs
        }

        // 2. Load Saved Settings (AsyncStorage)
        const saved = await getGeofence(); //Attempt to load any previously saved geofencing data from the phone's storage.
        const normalizedSaved = normalizeSavedGeofenceConfig(saved);

        if (normalizedSaved) {
          //If we find a previous geofence saved, we load the map with those settings
          setEnabled(normalizedSaved.enabled); // This turns the geofence toggle (on or off switch) to the position the user last left it
          setRadius(normalizedSaved.radius); //This sets the size of the radius circle. If the saved data is missing a size, it falls back to a standard default value
          if (normalizedSaved.region) {
            //If we find the center point based on the saved data, we set our map to a specifc region centerd around those coordinated with a small zoom area.
            setRegion(normalizedSaved.region);
          }
        }

        // 3. If no saved region, fetch live GPS automatically
        if (shouldFetchCurrentLocation(saved)) {
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
    if (!region || isSaving) return; //This stops the functions immediately if there are no gps coordinated seletected and if the user already clicked 'saved' and the app is still processing that first click. This prevents double clicking from causing errors
    const user = auth.currentUser; //Identifies the currently logged-in user to ensure location is saved to the correct account
    setIsSaving(true); // The app is now in the saving state

    try {
      if (user) {
        // 1. Firebase update - saves geofence settings to the user's account
        await updateGeofenceSettings(
          user.uid,
          region.latitude,
          region.longitude,
          radius,
        );

        // 2. Local storage update - saves geofence settings to the phone's storage
        await saveGeofence(buildGeofenceConfig(enabled, region, radius));

        // 3. Register/Unregister the actual Background Geofence
        if (enabled) {
          await Location.startGeofencingAsync(
            GEOFENCE_TASK_NAME,
            [
              //startGeofencingAsync is an expo tool that takes in a task name and watchfor when the user enters or leaves a specific geographic boundary
              buildGeofenceRegion(region, radius),
            ],
          );
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
            minimumValue={MIN_GEOFENCE_RADIUS}
            maximumValue={MAX_GEOFENCE_RADIUS}
            step={GEOFENCE_RADIUS_STEP}
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
