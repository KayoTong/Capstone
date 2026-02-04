import { StyleSheet, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter, Stack } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} /> 
      <StatusBar barStyle="light-content" />

      <View style={styles.visualContainer}>
        <View style={styles.iconCircle}>
           <Ionicons name="location" size={40} color="#2ECC71" />
        </View>
        
        <Text style={styles.logoText}>Before<Text style={{color: '#2ECC71'}}>IGo</Text></Text>
        <Text style={styles.tagline}>Peace of mind when you leave home.</Text>
        
        <View style={[styles.iconCircle, styles.bellCircle]}>
           <Ionicons name="notifications" size={50} color="#2ECC71" />
           <View style={styles.checkBadge}>
              <Ionicons name="checkmark" size={12} color="white" />
           </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.getStartedBtn} 
          onPress={() => router.push('./howItWorks' as any)} 
        >
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#0A1A10" />
        </TouchableOpacity>
        
        {/* 'How it Works' button has been removed from here */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 80 },
  visualContainer: { alignItems: 'center', width: '100%' },
  iconCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#111d15', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  bellCircle: { width: 120, height: 120, borderRadius: 30, marginTop: 40 },
  checkBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#2ECC71', borderRadius: 10, padding: 2 },
  logoText: { color: 'white', fontSize: 48, fontWeight: 'bold' },
  tagline: { color: '#888', fontSize: 18, textAlign: 'center', marginTop: 10, paddingHorizontal: 40 },
  footer: { width: '100%', paddingHorizontal: 30 },
  getStartedBtn: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  getStartedText: { color: '#0A1A10', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
});