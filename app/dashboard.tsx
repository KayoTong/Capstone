import { StyleSheet, View, Text, FlatList, Switch, TouchableOpacity, Linking } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const [items] = useState([
    { id: '1', name: 'Personal Wallet', active: true },
    { id: '2', name: 'House Keys', active: true },
  ]);

  const openMaps = () => {
    const url = `geo:40.7128,-74.0060?q=40.7128,-74.0060(Home)&mode=w`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com`));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Portable Essentials</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Switch value={item.active} trackColor={{ false: "#333", true: "#2ECC71" }} />
          </View>
        )}
      />
      <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
        <Text style={styles.mapButtonText}>Return Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 25, paddingTop: 60 },
  titleText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  itemCard: { backgroundColor: '#111d15', padding: 20, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { color: 'white', fontSize: 18 },
  mapButton: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  mapButtonText: { color: '#0A1A10', fontWeight: 'bold' }
});