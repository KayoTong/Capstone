import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter, Stack } from 'expo-router'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      <StatusBar barStyle="light-content" />

      <View style={styles.visualContainer}>
        {/* Top Location Icon */}
        <View style={styles.iconCircle}>
           <Ionicons name="location" size={40} color="#2ECC71" />
        </View>
        
        <Text style={styles.logoText}>Before<Text style={{color: '#2ECC71'}}>IGo</Text></Text>
        <Text style={styles.tagline}>Peace of mind when you leave home.</Text>
        
        {/* The Bell with Radiating Sound Waves */}
        <View style={styles.waveOuter}>
          <View style={styles.waveInner}>
            <View style={[styles.iconCircle, styles.bellCircle]}>
               <MaterialCommunityIcons name="bell-ring" size={60} color="#2ECC71" />
               <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={14} color="white" />
               </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {/* Main Button leads to the walkthrough section */}
        <TouchableOpacity 
          style={styles.getStartedBtn} 
          onPress={() => router.push('/howItWorks' as any)} 
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#0A1A10" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 80 },
  visualContainer: { alignItems: 'center', width: '100%' },
  
  // Radiating Wave/Ripple Styling
  waveOuter: {
    marginTop: 40,
    padding: 20,
    borderRadius: 120,
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.15)',
  },
  waveInner: {
    padding: 15,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(46, 204, 113, 0.3)',
  },
  
  iconCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#111d15', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  bellCircle: { width: 140, height: 140, borderRadius: 70, marginBottom: 0 }, 
  checkBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: '#2ECC71', borderRadius: 12, padding: 3, borderWidth: 2, borderColor: '#050c08' },
  
  logoText: { color: 'white', fontSize: 52, fontWeight: 'bold' },
  tagline: { color: '#888', fontSize: 18, textAlign: 'center', marginTop: 10, paddingHorizontal: 40 },
  footer: { width: '100%', paddingHorizontal: 30 },
  getStartedBtn: { backgroundColor: '#2ECC71', padding: 22, borderRadius: 25, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  getStartedText: { color: '#0A1A10', fontSize: 20, fontWeight: 'bold', marginRight: 10 },
});