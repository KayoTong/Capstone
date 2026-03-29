import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";
import { StatusBar, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../src/styles/index.styles";

export default function WelcomeScreen() {
  const router = useRouter(); //router is a variable that allows us to switch between different screens in our app. useRouter is a tool used to connect code with the naviagtion so we can switch between screens when certain buttons are pressed.

  const handlePress = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem("hasCompletedSetup");
      //Checks the phone's memory to see if the setup is already done. If it is, it sends the user to the home screen. If not, it sends them to the login screen.
      if (hasCompleted === "true") {
        // Returning User goes straight to Home. replace  is the action that causes the screen to switch, and "/home" is the name of the screen we want to switch to.
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
          <Text style={{ color: "#2ECC71" }}> BeforeIGo</Text>
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
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
