import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "./_styles/Home.styles";

export default function FinalHomeScreen() { // Main home screen displaying user's item status overview, with navigation to profile, dashboard, and how it works sections
  const router = useRouter();
  const { noBack } = useLocalSearchParams(); //   Check if we should disable back navigation (e.g., after signup)
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());
  const [profilePicUri, setProfilePicUri] = useState<string | null>(null);

  useEffect(() => { //    
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

  useFocusEffect( // Refresh profile picture URI whenever the screen comes into focus (e.g., after updating profile picture)
    React.useCallback(() => { // Refresh profile picture URI whenever the screen comes into focus (e.g., after updating profile picture)
      const loadProfilePic = async () => { // 
        const storedUri = await AsyncStorage.getItem('profilePicUri');
        setProfilePicUri(storedUri); // Update state with the latest profile picture URI
      };
      loadProfilePic();
    }, [])
  );

  const totalCount = items.length; //   Calculate total count of items, nearby (active) items, and away (inactive) items for display in the overview section
  const nearbyCount = items.filter(i => i.active).length; // Count of active items (considered "nearby")
  const awayCount = items.filter(i => !i.active && totalCount > 0).length;  // Count of inactive items (considered "away"), only show if there are items in total

  return ( // Main home screen displaying user's item status overview, with navigation to profile, dashboard, and how it works sections
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
          <TabItem emoji="🏠" label="Home" active onPress={undefined} />
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
