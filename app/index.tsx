import { StyleSheet, TouchableOpacity, View, Linking, FlatList, Switch } from 'react-native';
import React, { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  // 1. Data for your items (Software Developer logic)
  const [items, setItems] = useState([
    { id: '1', name: 'Personal Wallet', active: true },
    { id: '2', name: 'House Keys', active: true },
  ]);

  // 2. Google Maps Hand-off (The "Return Home" logic)
  const openMaps = () => {
    const lat = 40.7128; // Replace with your home latitude later
    const lon = -74.0060; // Replace with your home longitude later
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=walking`;
    Linking.openURL(url); //
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.greenText}>Portable Essentials</ThemedText>
        <ThemedText style={styles.statusText}>● GEOFENCING ACTIVE</ThemedText>
      </ThemedView>

      {/* Item List (Matches your Mockup) */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <ThemedText style={styles.itemText}>{item.name}</ThemedText>
            <Switch 
              value={item.active} 
              trackColor={{ false: "#333", true: "#2ECC71" }}
            />
          </View>
        )}
      />

      {/* The Google Maps MVP Button */}
      <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
        <ThemedText style={styles.buttonText}>Return Home (Google Maps)</ThemedText>
      </TouchableOpacity>

      {/* Add New Item Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => alert('Future step: Open Camera to add item')}
      >
        <ThemedText style={styles.addButtonText}>+ Add New Item</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#0A1A10' },
  header: { marginBottom: 20, backgroundColor: 'transparent' },
  greenText: { color: '#fff', fontSize: 28 },
  statusText: { color: '#2ECC71', fontSize: 12, fontWeight: 'bold', marginTop: 5 },
  itemCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#14261C', 
    padding: 20, 
    borderRadius: 15, 
    marginBottom: 10 
  },
  itemText: { color: 'white', fontSize: 18 },
  mapButton: { 
    backgroundColor: '#2ECC71', 
    padding: 15, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  addButton: { 
    padding: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#2ECC71', 
    borderRadius: 10 
  },
  buttonText: { color: '#0A1A10', fontWeight: 'bold' },
  addButtonText: { color: '#2ECC71', fontWeight: 'bold' },
});
