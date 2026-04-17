import { ChecklistItem, checklistStore } from "@/src/store/checklistStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location"; // Added for real-time GPS coordinates
import { Stack, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../firebaseConfig";
import { styles } from "../../src/styles/Home.styles";
import { getBeforeIGoWeather } from "../../weather";

export default function FinalHomeScreen() {
  // Main home screen displaying user's item status overview
  const router = useRouter();

  // State for items - initialized as empty to prevent ghost data
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);

  // Weather state to store data from the Tomorrow.io Weather API
  const [weather, setWeather] = useState<any>(null);
  // State to store the dynamic city name based on coordinates
  const [cityName, setCityName] = useState<string>("Loading...");

  // helper to generate per-user key for profile image
  const profileKey = (uid?: string) =>
    `profilePicUri_${uid || auth.currentUser?.uid || "anon"}`;

  useEffect(() => {
    // whenever the authenticated user changes we need to reload the data
    const unregisterAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        /**
         * RESET CHECK:
         * The manual clear() line has been removed to prevent item loss.
         * Data now persists across sessions and updates.
         */

        // Hard refresh from disk on login
        await checklistStore.loadFromDisk(user.uid);
        setItems([...checklistStore.getItems()]);

        const stored = await AsyncStorage.getItem(profileKey(user.uid));
        setProfilePicUri(stored);
      } else {
        checklistStore.clear();
        setItems([]);
        setProfilePicUri(null);
      }
    });

    // subscribe to future store updates
    const unsubscribe = checklistStore.subscribe(() => {
      // Direct sync with store to catch additions/deletions immediately
      const latestItems = checklistStore.getItems();
      setItems([...latestItems]);
    });

    // Fetch real-time location and weather data
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      const homeCoords = checklistStore.getHomeLocation();
      let lat: number;
      let lon: number;

      // Check for null to satisfy TypeScript and ensure correct location usage
      if (homeCoords.latitude !== null && homeCoords.longitude !== null) {
        lat = homeCoords.latitude;
        lon = homeCoords.longitude;
      } else if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lon = location.coords.longitude;
      } else {
        lat = 40.7685;
        lon = -73.9646;
      }

      // 2. Reverse Geocode to get the City Name dynamically
      try {
        const address = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lon,
        });
        if (address.length > 0) {
          const city =
            address[0].city || address[0].region || "Unknown Location";
          setCityName(city);
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }

      // 3. Fetch weather for those coordinates
      try {
        const data = await getBeforeIGoWeather(lat, lon);
        setWeather(data);
      } catch (e) {
        console.error("Weather fetch failed", e);
      }
    })();

    return () => {
      unregisterAuth();
      unsubscribe();
    };
  }, []);

  // Force sync on focus to clear any deleted items from memory
  useFocusEffect(
    React.useCallback(() => {
      const currentStoreItems = checklistStore.getItems();
      setItems([...currentStoreItems]);
    }, []),
  );

  // Derived state for the overview counters
  const { totalCount, nearbyCount, awayCount } = useMemo(() => {
    return {
      totalCount: items.length,
      nearbyCount: items.filter((i) => i.active).length,
      awayCount: items.filter((i) => !i.active).length,
    };
  }, [items]);

  // Critical Check for Title Urgency (turns title red if a high-priority item is missing)
  const missingCritical = items.some((i) => i.isCritical && !i.active);

  // Helper to determine which icon to show
  const getWeatherEmoji = (condition: string) => {
    const text = (condition || "").toLowerCase();
    const hour = new Date().getHours();
    const isNight = hour >= 19 || hour <= 6;

    if (text.includes("thunderstorm")) return "⛈️";
    if (text.includes("rain") || text.includes("drizzle")) return "🌧️";
    if (text.includes("snow") || text.includes("ice")) return "❄️";

    if (isNight) {
      if (text.includes("clear")) return "🌙";
      if (
        text.includes("partly") ||
        text.includes("scattered") ||
        text.includes("cloud") ||
        text.includes("overcast")
      ) {
        return "night-cloud-special";
      }
      return "🌙";
    }

    if (text.includes("clear") || text.includes("sunny")) return "☀️";
    if (text.includes("partly") || text.includes("scattered")) return "⛅";

    return "☁️";
  };

  return (
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
                    backgroundColor: "#12231A",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                   <Ionicons name="person" size={20} color="#2ECC71" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text
            style={[styles.mainTitle, missingCritical && { color: "#E74C3C" }]}
          >
            {missingCritical
              ? "Critical Items Missing!"
              : totalCount === 0
                ? "Welcome!"
                : "Ready to head out?"}
          </Text>

          {/* Intelligent Weather Block */}
          {weather && (
            <View
              style={{
                backgroundColor: "#12231A",
                padding: 15,
                borderRadius: 16,
                marginBottom: 15,
                borderWidth: 1,
                borderColor: weather.isCritical ? "#E74C3C" : "#2ECC71",
                flexDirection: weather.isCritical ? "column" : "row",
                alignItems: weather.isCritical ? "stretch" : "center",
              }}
            >
              {!weather.isCritical ? (
                <>
                  <Text style={{ fontSize: 32, marginRight: 15 }}>
                    {getWeatherEmoji(weather.conditionText)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      {cityName} {weather.temp}°F
                    </Text>
                    <Text style={{ color: "#95a5a6", fontSize: 12 }}>
                      Precip: {weather.precipitation}% | UV: {weather.uv} |
                      Humid: {weather.humidity}%
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#08100C",
                      padding: 10,
                      borderRadius: 10,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: "#12231A",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {cityName}
                    </Text>
                    <Text style={{ color: "#fff", fontSize: 16 }}>
                      {weather.temp}°F | Precip: {weather.precipitation}% | UV:{" "}
                      {weather.uv}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={weather.iconSymbol || "weather-cloudy"}
                      size={24}
                      color="#E74C3C"
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={{
                        color: "#E74C3C",
                        fontSize: 16,
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      {weather.alertTitle}
                    </Text>
                  </View>

                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      marginBottom: 15,
                      lineHeight: 20,
                    }}
                  >
                    {weather.alertBodyDetailed}
                  </Text>

                  {weather.itemImage && (
                    <View
                      style={{
                        width: "100%",
                        height: 180,
                        borderRadius: 12,
                        overflow: "hidden",
                        marginBottom: 10,
                      }}
                    >
                      <Image
                        source={weather.itemImage}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {weather.extraItems && weather.extraItems.length > 0 && (
                    <View style={{ marginTop: 5 }}>
                      {weather.extraItems.map((item: string) => (
                        <Text
                          key={item}
                          style={{ color: "#2ECC71", fontWeight: "bold" }}
                        >
                          + {item}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              )}
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

          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              marginTop: 14,
              marginBottom: 10,
            }}
          >
            Your Items ({totalCount})
          </Text>

          {/* Horizontal Items List */}
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
                  borderColor: item.isCritical ? "#2ECC71" : "#333",
                }}
              >
                <View
                  style={{
                    width: "100%",
                    height: 90,
                    borderRadius: 12,
                    backgroundColor: "#08100C",
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
                    <View
                      style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="cube-outline" size={32} color="#2ECC71" />
                    </View>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "bold",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {item.isCritical && (
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color="#2ECC71"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </View>
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
            {items.length === 0 && (
              <Text
                style={{ color: "#95A5A6", fontStyle: "italic", marginLeft: 5 }}
              >
                No items added yet.
              </Text>
            )}
          </ScrollView>

          {/* Stats Overview */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Items Overview</Text>
            <TouchableOpacity onPress={() => router.push("/dashboard")}>
              <Text style={styles.viewAll}>View All →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <StatBox count={totalCount} label="Total" color="#2ECC71" />
            <StatBox count={nearbyCount} label="Nearby" color="#2ECC71" />
            <StatBox count={awayCount} label="Away" color="#2ECC71" />
          </View>

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
              borderColor: "#333",
            }}
            onPress={() => router.push("/geofencesetup")}
          >
            <View
              style={{
                width: 45,
                height: 45,
                borderRadius: 10,
                backgroundColor: "#08100C",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="map-outline" size={24} color="#2ECC71" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 16, color: "white" }}
              >
                Edit Home Zone
              </Text>
              <Text style={{ color: "#95a5a6", fontSize: 13 }}>
                Adjust your GPS detection radius.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#2ECC71" />
          </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/addItem")}
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
      border && { borderBottomWidth: 1, borderBottomColor: "#333" },
    ]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={22}
      color="#2ECC71"
      style={{ marginRight: 15 }}
    />
    <View style={{ flex: 1 }}>
      <Text style={styles.menuText}>{name}</Text>
      <Text style={styles.menuSubText}>{sub}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#2ECC71" />
  </TouchableOpacity>
);