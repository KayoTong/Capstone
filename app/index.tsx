import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { styles } from "./index.styles";
import {
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const handlePress = async () => {
    try {
      // 1. Check if the user has finished the 15-week setup before
      const hasCompleted = await AsyncStorage.getItem("hasCompletedSetup");

      if (hasCompleted === "true") {
        // Returning User -> Go straight to Home
        router.replace("/home");
      } else {
        // New User -> Go to Login/Sign Up first
        // We use 'login' because that's the next file we're creating
        router.push("/login");
      }
    } catch (e) {
      // Fallback: If storage fails, send to login
      router.push("/login");
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />

      <View style={styles.visualContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name="location" size={40} color="#2ECC71" />
        </View>

        <Text style={styles.logoText}>
          Before<Text style={{ color: "#2ECC71" }}>IGo</Text>
        </Text>
        <Text style={styles.tagline}>Peace of mind when you leave home.</Text>

        <View style={styles.waveOuter}>
          <View style={styles.waveInner}>
            <View style={[styles.iconCircle, styles.bellCircle]}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={60}
                color="#2ECC71"
              />
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={14} color="white" />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.getStartedBtn} onPress={handlePress}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#0A1A10" />
        </TouchableOpacity>
      </View>
    </View>
  );
}