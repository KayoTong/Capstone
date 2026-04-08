import { ChecklistItem, checklistStore } from "@/src/store/checklistStore";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location"; // Added for real-time GPS coordinates
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebaseConfig";
import { styles } from "../../src/styles/Home.styles";
import { getBeforeIGoWeather } from "../../weather";

export default function FinalHomeScreen() {
  // Main home screen displaying user's item status overview, with navigation to profile, dashboard, and how it works sections
  const router = useRouter(); //router is a variable that allows us to switch between different screens in our app. useRouter is a tool used to connect code with the naviagtion so we can switch between screens when certain buttons are pressed.
  const [items, setItems] = useState<ChecklistItem[]>(
    checklistStore.getItems(),
  ); // items store an array of checklist items that the user added to their collection. setItems allows the user to add or delete items.useState gets the list of iteme from the checklistStore, which holds the storage of the checklist items. checklistStore.getItems is a function that retrieves the current list of items.
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null); // Stores the photo's address (string) or nothing (null); setProfilePicUri updates it and refreshes the screen.

  // Weather state to store data from the Google Weather API
  const [weather, setWeather] = useState<any>(null);

  // helper to generate per-user key for profile image
  const profileKey = (uid?: string) =>
    `profilePicUri_${uid || auth.currentUser?.uid || "anon"}`;

  useEffect(() => {
    // whenever the authenticated user changes we need to reload the data
    const unregisterAuth = onAuthStateChanged(auth, async (user) => {
      // onAuthStateChanged is a tracker that executes code whenever the user's login status changes; unregisterAuth stores the unsubscribe function used to stop the tracker.
      if (user) {
        //if the user is successfully logged in, checklistStore.loadFromDisk(user.uid) retreives the user's checklist items from the phones storage based on the user id.
        await checklistStore.loadFromDisk(user.uid);
        setItems([...checklistStore.getItems()]);

        // also load the correct profile picture for this user
        const stored = await AsyncStorage.getItem(profileKey(user.uid));
        setProfilePicUri(stored);
      } else {
        // no user signed in; clear local store to avoid seeing old data
        checklistStore.clear();
        setItems([]);
        setProfilePicUri(null);
      }
    });

    // subscribe to future store updates
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });

    // Fetch real-time location and weather data
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        // Fallback to Hunter College if permission denied
        const data = await getBeforeIGoWeather(40.7685, -73.9646);
        setWeather(data);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const data = await getBeforeIGoWeather(
        location.coords.latitude,
        location.coords.longitude,
      );
      setWeather(data);
    })();

    return () => {
      //These kill the background processes that occur when the user is closing the current screen
      unregisterAuth();
      unsubscribe();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      //saves the function memory so it doesn't get recreated everytime the screen re-renders
      const loadProfilePic = async () => {
        const storedUri = await AsyncStorage.getItem(profileKey());
        setProfilePicUri(storedUri); //retrieves the profile picture URI and updates it the current screen.
      };
      loadProfilePic(); //this function call invokes the entire process of getting the profile picture URI from storage
    }, []),
  );

  const totalCount = items.length; //   Calculate total count of items, nearby (active) items, and away (inactive) items for display in the overview section
  const nearbyCount = items.filter((i) => i.active).length; // Count of active items (considered "nearby")
  const awayCount = items.filter((i) => !i.active && totalCount > 0).length; // Count of inactive items (considered "away"), only show if there are items in total

  // Helper to determine which icon to show based on Google Weather text descriptions
  const getWeatherEmoji = (condition: string) => {
    const text = (condition || "").toLowerCase();

    if (text.includes("thunderstorm")) return "⛈️";
    if (text.includes("rain") || text.includes("drizzle")) return "🌧️";
    if (text.includes("snow") || text.includes("ice")) return "❄️";
    if (text.includes("cloud") || text.includes("overcast")) return "☁️";
    if (text.includes("fog") || text.includes("mist")) return "🌫️";
    if (text.includes("clear") || text.includes("sunny")) return "☀️";

    return "☀️"; // Default to Sun for any other description
  };

  return (
    // Main home screen displaying user's item status overview, with navigation to profile, dashboard, and how it works sections
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Ionicons name="location" size={26} color="white" />
              </View>
              <Text style={styles.logoText}>BeforeIGo</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/profile")}
              style={{ position: "relative" }}
            >
              {profilePicUri ? (
                <Image
                  source={{ uri: profilePicUri }}
                  style={{ width: 45, height: 45, borderRadius: 22.5 }}
                />
              ) : (
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    backgroundColor: "#f0e0d0",
                  }}
                />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.mainTitle}>
            {totalCount === 0 ? "Welcome!" : "Ready to head out?"}
          </Text>

          {/* Weather Section - Displays live temperature and probability of rain from Google */}
          {weather && (
            <View
              style={{
                backgroundColor: "#12231A",
                padding: 15,
                borderRadius: 16,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: "#2ECC71",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 15 }}>
                {getWeatherEmoji(weather.conditionText)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}
                >
                  {weather.temp}°F
                </Text>
                <Text style={{ color: "#95a5a6", fontSize: 12 }}>
                  Rain: {weather.precipProb}% | UV: {weather.uv} | Humid:{" "}
                  {weather.humidity}%
                </Text>
              </View>
            </View>
          )}

          <View style={styles.statusRow}>
            <Text style={styles.locationText}>Home Location Set</Text>
            <Text style={styles.divider}>•</Text>
            <View style={styles.activeBadge}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#2ECC71",
                  marginRight: 6,
                }}
              />
              <Text style={styles.activeText}>Monitoring Active</Text>
            </View>
          </View>

          {/* Displays 'Your Items' to the user */}
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            Your Items
          </Text>

          {/* Added a carousel block to let user see items they have saved 
            on the Home Page as well as the 'Items' page */}
          {items.length === 0 ? (
            <View
              style={{
                backgroundColor: "#12231A",
                padding: 20,
                borderRadius: 16,
                marginBottom: 25,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, marginBottom: 8 }}>
                No items added yet
              </Text>
              <Text style={{ color: "#95a5a6", fontSize: 13 }}>
                Add your first item from the 'Items' tab
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, paddingBottom: 10 }}
            >
              {items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    width: 160,
                    backgroundColor: "#12231A",
                    borderRadius: 16,
                    padding: 15,
                    marginRight: 12,
                    borderWidth: 1,
                    borderColor: "#f1f1f1",
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      height: 90,
                      borderRadius: 12,
                      backgroundColor: "#E8F8F0",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 10,
                      overflow: "hidden",
                    }}
                  >
                    {item.photoUri ? (
                      <Image
                        source={{ uri: item.photoUri }}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="cube-outline" size={32} color="#2ECC71" />
                    )}
                  </View>

                  <Text
                    style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>

                  <Text
                    style={{
                      color: item.active ? "#2ECC71" : "#95A5A6",
                      marginTop: 6,
                    }}
                  >
                    {item.active ? "Nearby" : "Away"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {/* 2. ITEMS OVERVIEW SECTION (Reverted name) */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}> Items Overview</Text>
            <TouchableOpacity onPress={() => router.push("/dashboard")}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <StatBox count={totalCount} label="Total" color="#2ECC71" />
            <StatBox count={nearbyCount} label="Nearby" color="#2ECC71" />
            <StatBox count={awayCount} label="Away" color="#2ECC71" />
          </View>

          {/* 3. LOCATION SETTINGS CARD */}
          <Text style={styles.sectionLabel}>Location Settings</Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              backgroundColor: "#12231A",
              padding: 15,
              borderRadius: 12,
              alignItems: "center",
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#f1f1f1",
            }}
            onPress={() => router.push("/geofencesetup")}
          >
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 10,
                backgroundColor: "#E8F8F0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="map-outline" size={24} color="#2ECC71" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 16, color: "#2ECC71" }}
              >
                Edit Home Zone
              </Text>
              <Text style={{ color: "#95a5a6", fontSize: 13 }}>
                Adjust your GPS detection radius.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          {/* 4. MENU */}
          <Text style={styles.sectionLabel}>Menu</Text>
          <View style={styles.menuContainer}>
            <MenuListItem
              icon="help-circle-outline"
              name="Help & Tutorials"
              sub="Learn how it works"
              onPress={() => router.push("/howItWorks?from=home")}
            />
            <MenuListItem
              icon="settings-outline"
              name="Account Settings"
              sub="Manage your profile"
              border={false}
            />
          </View>
        </ScrollView>

        {/* Floating Plus Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/dashboard")}
        >
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}

const StatBox = ({ count, label, color }: any) => (
  <View style={styles.statBox}>
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const MenuListItem = ({ icon, name, sub, border = true, onPress }: any) => (
  <TouchableOpacity
    style={[
      styles.menuRow,
      border && { borderBottomWidth: 1, borderBottomColor: "#f1f1f1" },
    ]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={22} color="#555" style={{ marginRight: 15 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.menuText}>{name}</Text>
      <Text style={styles.menuSubText}>{sub}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#eee" />
  </TouchableOpacity>
);
