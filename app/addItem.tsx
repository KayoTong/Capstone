import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddItem() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>New Item</Text>

      {/* Image Circle Placeholder */}
      <View style={styles.imageCircle}>
        <View style={styles.cameraIcon}>
          <Ionicons name="camera" size={20} color="black" />
        </View>
      </View>

      <Text style={styles.label}>Item Name</Text>
      <TextInput style={styles.input} placeholder="e.g. Work Keys" placeholderTextColor="#555" />

      <TouchableOpacity style={styles.saveBtn} onPress={() => router.push('/dashboard')}>
        <Text style={styles.saveBtnText}>Save Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 25, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 20, textAlign: 'center', fontWeight: 'bold' },
  imageCircle: { width: 150, height: 150, borderRadius: 75, backgroundColor: '#111d15', alignSelf: 'center', marginTop: 40 },
  cameraIcon: { position: 'absolute', bottom: 5, right: 10, backgroundColor: '#2ECC71', padding: 8, borderRadius: 15 },
  label: { color: 'white', marginTop: 30, fontSize: 16 },
  input: { backgroundColor: '#111d15', color: 'white', padding: 15, borderRadius: 10, marginTop: 10 },
  saveBtn: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, marginTop: 'auto', alignItems: 'center' },
  saveBtnText: { fontWeight: 'bold', fontSize: 18 }
});