import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList, Image,
  Modal, Pressable,
  StyleSheet, Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState(checklistStore.getItems());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Search States
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    /* NEW LOGIC: Refresh data from disk immediately when entering the screen */
    const loadData = async () => {
      await checklistStore.loadFromDisk();
      setItems([...checklistStore.getItems()]);
    };
    
    loadData();

    // Standard subscription for any changes that happen while the screen is open
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  // Filter items based on what the user types
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: ChecklistItem }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={() => item.photoUri && setSelectedImage(item.photoUri)}
      >
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderIcon}><Ionicons name="cube" size={24} color="#2ECC71" /></View>
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.verifiedRow}>
          {/* LOGIC: Change icon color/style if not verified */}
          <Ionicons 
            name={item.lastChecked ? "checkmark-circle" : "ellipse-outline"} 
            size={14} 
            color={item.lastChecked ? "#2ECC71" : "#4A5D52"} 
          />
          <Text style={[styles.verifiedText, !item.lastChecked && { color: '#4A5D52' }]}>
            {item.lastChecked ? `Checked: ${item.lastChecked}` : 'Not verified'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header with Search Toggle */}
      <View style={styles.header}>
        {!isSearching ? (
          <>
            <Text style={styles.headerTitle}>History</Text>
            <TouchableOpacity onPress={() => setIsSearching(true)}>
              <Ionicons name="search-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#4A5D52" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search items..."
              placeholderTextColor="#4A5D52"
              autoFocus
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
              <Ionicons name="close-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>ITEM ACTIVITY</Text>}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {searchQuery ? `No matches for "${searchQuery}"` : "No items found."}
          </Text>
        }
      />

      {/* WhatsApp Style Full-Screen Photo Modal */}
      <Modal visible={!!selectedImage} transparent={true} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedImage(null)}>
          <View style={styles.modalContent}>
            <Image source={{ uri: selectedImage || '' }} style={styles.fullImage} resizeMode="contain" />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedImage(null)}>
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#6B7A74' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, minHeight: 70 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  searchBarContainer: { flex: 1, flexDirection: 'row', backgroundColor: '#6B7A74', borderRadius: 15, paddingHorizontal: 15, alignItems: 'center', height: 45 },
  searchInput: { flex: 1, color: '#fff', fontSize: 16 },
  sectionTitle: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 15, letterSpacing: 2 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  card: { flexDirection: 'row', backgroundColor: '#12231A', borderRadius: 25, padding: 12, marginBottom: 12, alignItems: 'center' },
  imageContainer: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: '#E8F3ED', overflow: 'hidden' },
  itemImage: { width: '100%', height: '100%' },
  placeholderIcon: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  infoContainer: { marginLeft: 15 },
  itemName: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  verifiedText: { color: '#2ECC71', fontSize: 12, marginLeft: 4 },
  emptyText: { color: '#4A5D52', textAlign: 'center', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width, height: width },
  fullImage: { width: '100%', height: '100%' },
  closeBtn: { position: 'absolute', top: -100, right: 20 }
});