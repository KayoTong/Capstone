import { StyleSheet, TouchableOpacity, View, Text, Linking, FlatList, Switch } from 'react-native';
import React, { useState } from 'react';

export default function HomeScreen() {
  const [items, setItems] = useState([
    { id: '1', name: 'Personal Wallet', active: true },
    { id: '2', name: 'House Keys', active: true },
  ]);

  const openMaps = () => {
    const lat = 40.7128; 
    const lon = -74.0060; 
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
    Linking.openURL(url); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.greenText, { fontWeight: 'bold' }]}>Portable Essentials</Text>
        <Text style={styles.statusText}>● GEOFENCING ACTIVE</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Switch 
              value={item.active} 
              trackColor={{ false: "#333", true: "#2ECC71" }}
            />
          </View>
        )}
      />

      <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
        <Text style={styles.buttonText}>Return Home (Google Maps)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.addButton} onPress={() => alert('Future step: Camera')}>
        <Text style={styles.addButtonText}>+ Add New Item</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0A1A10' },
  header: { marginBottom: 20 },
  greenText: { color: '#fff', fontSize: 28 },
  statusText: { color: '#2ECC71', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  itemCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#14261C', padding: 20, borderRadius: 15, marginBottom: 10 },
  itemText: { color: 'white', fontSize: 18 },
  mapButton: { backgroundColor: '#2ECC71', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  addButton: { padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#2ECC71', borderRadius: 10 },
  buttonText: { color: '#0A1A10', fontWeight: 'bold' },
  addButtonText: { color: '#2ECC71', fontWeight: 'bold' },
});