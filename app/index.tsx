import { StyleSheet, View, Text, TouchableOpacity, FlatList, Switch, StatusBar } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  // Logic: 'welcome' shows the logo screen, 'dashboard' shows the list
  const [screen, setScreen] = useState('welcome');
  const [items, setItems] = useState([
    { id: '1', name: 'Personal Wallet', active: true },
    { id: '2', name: 'House Keys', active: true },
  ]);

  // --- VIEW 1: WELCOME SCREEN (Matches your image) ---
  if (screen === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.visualContainer}>
          <View style={styles.iconCircle}><Ionicons name="location" size={40} color="#2ECC71" /></View>
          <Text style={styles.logoText}>Before<Text style={{color: '#2ECC71'}}>IGo</Text></Text>
          <Text style={styles.tagline}>Peace of mind when you leave home.</Text>
          <View style={[styles.iconCircle, styles.bellCircle]}>
             <Ionicons name="notifications" size={50} color="#2ECC71" />
          </View>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.getStartedBtn} onPress={() => setScreen('dashboard')}>
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#0A1A10" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- VIEW 2: DASHBOARD (Your existing logic) ---
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setScreen('welcome')}>
          <Ionicons name="chevron-back" size={24} color="#2ECC71" />
        </TouchableOpacity>
        <Text style={styles.titleText}>Portable Essentials</Text>
      </View>
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Switch value={item.active} trackColor={{ false: "#333", true: "#2ECC71" }} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 25 },
  visualContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: 'white', fontSize: 42, fontWeight: 'bold' },
  tagline: { color: '#888', textAlign: 'center', marginTop: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#111d15', justifyContent: 'center', alignItems: 'center' },
  bellCircle: { width: 100, height: 100, marginTop: 30 },
  footer: { marginBottom: 40 },
  getStartedBtn: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  getStartedText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 18, marginRight: 10 },
  header: { marginTop: 50, marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  titleText: { color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  itemCard: { backgroundColor: '#111d15', padding: 20, borderRadius: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  itemText: { color: 'white', fontSize: 18 }
});