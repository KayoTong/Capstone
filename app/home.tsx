import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MainHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header: SafeHome Logo & Profile */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <MaterialCommunityIcons name="shield-check" size={24} color="white" />
            </View>
            <Text style={styles.logoText}>SafeHome</Text>
          </View>
          <View style={styles.profileContainer}>
            <View style={styles.profilePlaceholder} />
            <View style={styles.onlineDot} />
          </View>
        </View>

        {/* Hero Text */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Hello,</Text>
          <Text style={styles.heroTitleBold}>ready to head out?</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Geofencing Active</Text>
          </View>
        </View>

        {/* Quick Actions Section */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/dashboard' as any)}>
            <View style={styles.cardIconCircle}>
              <Ionicons name="add" size={24} color="#2ECC71" />
            </View>
            <Text style={styles.cardMainText}>Add Item</Text>
            <Text style={styles.cardSubText}>Track a new{"\n"}essential</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/dashboard' as any)}>
            <View style={[styles.cardIconCircle, { backgroundColor: '#e8fdf0' }]}>
              <MaterialCommunityIcons name="clipboard-check" size={24} color="#2ECC71" />
            </View>
            <Text style={styles.cardMainText}>Status</Text>
            <Text style={styles.cardSubText}>Verify all items</Text>
          </TouchableOpacity>
        </View>

        {/* Menu List Section */}
        <Text style={styles.sectionLabel}>Menu</Text>
        <View style={styles.menuContainer}>
          <MenuItem icon="help-circle-outline" title="Help & Tutorials" sub="Learn how it works" />
          <MenuItem icon="time-outline" title="Security History" sub="View past logs" />
          <MenuItem icon="settings-outline" title="Account Settings" sub="Manage your profile" border={false} />
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/dashboard' as any)}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TabItem icon="home" label="Home" active />
        <TabItem icon="map-outline" label="Map" />
        <TabItem icon="archive-outline" label="Items" />
        <TabItem icon="person-outline" label="Profile" />
      </View>
    </SafeAreaView>
  );
}

// Sub-components for cleaner code
function MenuItem({ icon, title, sub, border = true }: any) {
  return (
    <TouchableOpacity style={[styles.menuItem, border && styles.menuBorder]}>
      <View style={styles.menuIconBox}><Ionicons name={icon} size={22} color="#555" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubTitle}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}

function TabItem({ icon, label, active = false }: any) {
  return (
    <TouchableOpacity style={styles.tabItem}>
      <Ionicons name={icon} size={24} color={active ? '#2ECC71' : '#aaa'} />
      <Text style={[styles.tabLabel, active && { color: '#2ECC71' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  scrollContent: { padding: 25, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { backgroundColor: '#2ECC71', padding: 8, borderRadius: 10, marginRight: 10 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a' },
  profileContainer: { width: 45, height: 45 },
  profilePlaceholder: { flex: 1, backgroundColor: '#f0e0d0', borderRadius: 22.5 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#2ECC71', borderWidth: 2, borderColor: 'white' },
  heroSection: { marginBottom: 40 },
  heroTitle: { fontSize: 36, color: '#1a1a1a' },
  heroTitleBold: { fontSize: 36, fontWeight: 'bold', color: '#1a1a1a', marginTop: -5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 8 },
  statusText: { color: '#7f8c8d', fontSize: 16 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  actionCard: { backgroundColor: 'white', width: '47%', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, elevation: 3 },
  cardIconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f2fff7', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  cardMainText: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
  cardSubText: { fontSize: 13, color: '#95a5a6', marginTop: 4 },
  menuContainer: { backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#f1f1f1' },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  menuSubTitle: { fontSize: 13, color: '#95a5a6' },
  fab: { position: 'absolute', bottom: 100, right: 25, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#2ECC71', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#2ECC71', shadowOpacity: 0.4, shadowRadius: 10 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, backgroundColor: 'white', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f1f1', paddingBottom: 15 },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 12, color: '#aaa', marginTop: 4 }
});