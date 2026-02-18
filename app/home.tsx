import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function FinalHomeScreen() {
  const router = useRouter();
  const { noBack } = useLocalSearchParams();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);

  useEffect(() => {
    // 1. Load saved data from phone storage on startup
    const initStore = async () => {
      if (checklistStore.loadFromDisk) {
        await checklistStore.loadFromDisk();
        setItems([...checklistStore.getItems()]);
      }
    };
    initStore();

    // 2. Subscribe to any future changes
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const loadProfilePic = async () => {
        const storedUri = await AsyncStorage.getItem('profilePicUri');
        setProfilePicUri(storedUri);
      };
      loadProfilePic();
    }, [])
  );

  const totalCount = items.length;
  const nearbyCount = items.filter(i => i.active).length;
  const awayCount = items.filter(i => !i.active && totalCount > 0).length; 

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
               <Ionicons name="location" size={26} color="white" />
            </View>
            <Text style={styles.logoText}>BeforeIGo</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={{ position: 'relative' }}>
            {profilePicUri ? (
              <Image source={{ uri: profilePicUri }} style={{ width: 45, height: 45, borderRadius: 22.5 }} />
            ) : (
              <View style={{ width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f0e0d0' }} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.mainTitle}>
          {totalCount === 0 ? "Welcome!" : "Ready to head out?"}
        </Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.locationText}>📍 You're at Home</Text>
          <Text style={styles.divider}>•</Text>
          <View style={styles.activeBadge}>
            <View style={styles.greenDot} />
            <Text style={styles.activeText}>Geofencing Active</Text>
          </View>
        </View>

        {/* 1. ALERT CARD */}
        <View style={[styles.alertCard, { borderLeftColor: totalCount === 0 ? '#ccc' : '#2ECC71', backgroundColor: totalCount === 0 ? '#f9f9f9' : '#f2fff7' }]}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIconBg}>
              <Text style={{ fontSize: 24 }}>{totalCount === 0 ? "📦" : "✅"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{totalCount === 0 ? "No items tracked" : "All items secured"}</Text>
              <Text style={styles.alertSub}>
                {totalCount === 0 ? "Tap the + button to add your first item." : `Monitoring ${nearbyCount} active items.`}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. OVERVIEW GRID - Updated path to /dashboard */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>📊 Items Overview</Text>
          <TouchableOpacity onPress={() => router.push('/dashboard')}>
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statsGrid}>
          <StatBox count={totalCount} label="Total" color="#2ECC71" />
          <StatBox count={nearbyCount} label="Nearby" color="#2ECC71" />
          <StatBox count={awayCount} label="Away" color="#f39c12" />
        </View>

        {/* 3. ITEMS LIST */}
        <Text style={styles.sectionLabel}>Essential Items</Text>
        {items.length > 0 ? (
          items.map((item) => (
            <ItemRow 
              key={item.id} 
              photoUri={item.photoUri} 
              name={item.name} 
              status={item.active ? "Nearby" : "Disabled"} 
              statusColor={item.active ? "#2ECC71" : "#999"} 
            />
          ))
        ) : (
          <Text style={{ color: '#999', fontStyle: 'italic', marginBottom: 20 }}>List is currently empty.</Text>
        )}

        {/* 4. MENU */}
        <Text style={styles.sectionLabel}>Menu</Text>
        <View style={styles.menuContainer}>
          <MenuListItem icon="help-circle-outline" name="Help & Tutorials" sub="Learn how it works" onPress={() => router.push('/howItWorks?from=home')} />
          <MenuListItem icon="settings-outline" name="Account Settings" sub="Manage your profile" border={false} />
        </View>
      </ScrollView>

      {/* Floating Plus Button - Updated path to /dashboard */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/dashboard')}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* 5. TAB BAR */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          <TabItem emoji="🏠" label="Home" active onPress={() => router.push('/home')} />
          <TabItem emoji="🗺️" label="Map" onPress={() => router.push('/geofencesetup')} />
          <TabItem emoji="📦" label="Items" onPress={() => router.push('/dashboard')} />
            <TabItem emoji="👤" label="Profile" onPress={() => router.push('/profile')} />
        </View>
      </View>
    </SafeAreaView>
    </>
  );
}

// ... (Keep StatBox, ItemRow, MenuListItem, TabItem, and Styles exactly as they were)
const StatBox = ({ count, label, color }: any) => (
  <View style={styles.statBox}>
    <Text style={[styles.statCount, { color }]}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ItemRow = ({ photoUri, name, status, statusColor }: any) => (
  <View style={styles.itemRow}>
    <View style={styles.itemIconBg}>
      <Image source={{ uri: photoUri }} style={styles.itemImage} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemName}>{name}</Text>
      <View style={[styles.itemStatusBadge, { backgroundColor: `${statusColor}20` }]}>
        <View style={[styles.smallDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.itemStatusText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#ccc" />
  </View>
);

const MenuListItem = ({ icon, name, sub, border = true, onPress }: any) => (
  <TouchableOpacity style={[styles.menuRow, border && { borderBottomWidth: 1, borderBottomColor: '#f1f1f1' }]} onPress={onPress}>
    <Ionicons name={icon} size={22} color="#555" style={{ marginRight: 15 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.menuText}>{name}</Text>
      <Text style={styles.menuSubText}>{sub}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#eee" />
  </TouchableOpacity>
);

const TabItem = ({ emoji, label, active = false, onPress }: any) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <Text style={{ fontSize: 26, marginBottom: 4 }}>{emoji}</Text>
    <Text style={[styles.tabLabel, active && { color: '#2ECC71', fontWeight: 'bold' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 160 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { backgroundColor: '#2ECC71', width: 45, height: 45, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText: { fontSize: 24, fontWeight: '900', color: '#1a1a1a' },
  profileCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f0e0d0' },
  mainTitle: { fontSize: 34, fontWeight: 'bold', color: '#1a1a1a' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 25 },
  locationText: { color: '#7f8c8d', fontSize: 16 },
  divider: { marginHorizontal: 8, color: '#ccc' },
  activeBadge: { flexDirection: 'row', alignItems: 'center' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 6 },
  activeText: { color: '#2ECC71', fontWeight: 'bold', fontSize: 16 },
  alertCard: { borderRadius: 24, padding: 20, borderLeftWidth: 6, marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  alertHeader: { flexDirection: 'row', alignItems: 'center' },
  alertIconBg: { padding: 12, backgroundColor: '#fff', borderRadius: 15, marginRight: 15 },
  alertTitle: { fontSize: 18, fontWeight: 'bold' },
  alertSub: { fontSize: 14, color: '#95a5a6' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionLabel: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  viewAll: { color: '#2ECC71', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { backgroundColor: '#fff', width: '31%', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#f1f1f1' },
  statCount: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#95a5a6' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#f8f8f8' },
  itemIconBg: { width: 55, height: 55, borderRadius: 18, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemImage: { width: '100%', height: '100%', borderRadius: 18 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 5 },
  smallDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  itemStatusText: { fontSize: 13, fontWeight: 'bold' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f1f1', overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  menuText: { fontSize: 17, fontWeight: 'bold' },
  menuSubText: { fontSize: 13, color: '#95a5a6' },
  fab: { position: 'absolute', bottom: 120, right: 25, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#2ECC71', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  tabBarWrapper: { position: 'absolute', bottom: 0, width: '100%', height: 110 },
  tabBar: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f1f1f1' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 14, color: '#aaa' },
});