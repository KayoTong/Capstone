import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

      <TouchableOpacity style={styles.startBtn} onPress={() => router.push(from === 'home' ? '/home' : '/setup' as any)}> 
        <View style={styles.btnNumber}><Text style={styles.numberText}>3</Text></View>
        <Text style={styles.startBtnText}>Got It, Let's Start</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 25 },
  scrollContent: { paddingTop: 60, paddingBottom: 140 },
  titleText: { color: '#0A3D2E', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  subtitleText: { color: '#888', textAlign: 'center', marginBottom: 40 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  numberCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#0A3D2E', justifyContent: 'center', alignItems: 'center' },
  numberText: { fontWeight: 'bold', color: '#0A3D2E' },
  stepTextContent: { marginLeft: 15, flex: 1 },
  stepTitle: { fontWeight: 'bold', color: '#0A3D2E', fontSize: 18 },
  stepDesc: { color: '#666', marginTop: 5 },
  imagePlaceholder: { 
    width: '100%', 
    height: 250, // Increased to 250 so "cover" mode shows more of the items
    backgroundColor: '#fbfbfb', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 40, 
    overflow: 'hidden',
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  fullImage: { width: '100%', height: '100%' },
  uiCard: { backgroundColor: '#fff', width: '85%', borderRadius: 12, padding: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  uiRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  uiText: { flex: 1, marginLeft: 10, color: '#0A3D2E', fontWeight: '500' },
  uiSwitchActive: { width: 40, height: 22, backgroundColor: '#2ECC71', borderRadius: 11 },
  uiDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },
  startBtn: { backgroundColor: '#0A3D2E', padding: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 30, left: 25, right: 25 },
  btnNumber: { backgroundColor: '#E8F5E9', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});