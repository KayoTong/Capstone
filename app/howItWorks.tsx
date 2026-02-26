import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from "../src/styles/howitWorks.styles";

export default function HowItWorks() {
  const router = useRouter();
  const { from } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.titleText}>How It Works</Text>
        <Text style={styles.subtitleText}>Never leave your essentials behind again.</Text>

        {/* Step 1: Capture */}
        <View style={styles.stepRow}>
          <View style={styles.numberCircle}><Text style={styles.numberText}>1</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={styles.stepTitle}>STEP 1: CAPTURE</Text>
            <Text style={styles.stepDesc}>Take a clear photo of your essential item to register it.</Text>
          </View>
        </View>
        
        <View style={styles.imagePlaceholder}>
          <Image 
            source={{ uri: 'https://thumbs.dreamstime.com/b/everyday-carry-essentials-stylish-personal-accessories-modern-life-collection-everyday-carry-essentials-displayed-403261655.jpg' }} 
            style={styles.fullImage}
            resizeMode="cover" // Fills the entire border
          />
        </View>

        {/* Step 2: Set Up */}
        <View style={styles.stepRow}>
          <View style={styles.numberCircle}><Text style={styles.numberText}>2</Text></View>
          <View style={styles.stepTextContent}>
            <Text style={styles.stepTitle}>STEP 2: SET UP</Text>
            <Text style={styles.stepDesc}>Give your item a name and enable geofence tracking.</Text>
          </View>
        </View>

        <View style={styles.imagePlaceholder}>
          <View style={styles.uiCard}>
            <View style={styles.uiRow}>
              <Ionicons name="key" size={20} color="#0A3D2E" />
              <Text style={styles.uiText}>House Keys</Text>
              <View style={styles.uiSwitchActive} />
            </View>
            <View style={styles.uiDivider} />
            <View style={styles.uiRow}>
              <Ionicons name="notifications" size={20} color="#0A3D2E" />
              <Text style={styles.uiText}>Geofence Alerts</Text>
              <View style={styles.uiSwitchActive} />
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.startBtn} onPress={() => router.replace(from === 'home' ? '/home?noBack=true' : '/setup' as any)}> 
        <View style={styles.btnNumber}><Text style={styles.numberText}>3</Text></View>
        <Text style={styles.startBtnText}>Got It, Let's Start</Text>
      </TouchableOpacity>
    </View>
  );
}

// I removed the styles component from this file and put it in a separate file called howitWorks.styles.ts to keep the code cleaner and more organized.
