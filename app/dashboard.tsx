import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function PortableEssentials() {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());

  useEffect(() => {
    // Subscribe to store changes to keep UI in sync
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (id: string) => {
    checklistStore.toggleItem(id);
  };

  const handleDelete = (id: string, itemName: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => checklistStore.removeItem(id) 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Portable Essentials</Text>
      
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            {item.photoUri && (
              <Image source={{ uri: item.photoUri }} style={styles.itemPhoto} />
            )}
            <View style={styles.itemContent}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Switch 
                value={item.active} 
                onValueChange={() => handleToggle(item.id)}
                trackColor={{ false: "#333", true: "#2ECC71" }} 
              />
            </View>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.name)}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items added yet</Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push("/addItem")}
      >
        <Ionicons name="add" size={28} color="white" />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      {/* FIXED NAVIGATION PATH HERE */}
      <TouchableOpacity 
        style={styles.mapButton} 
        onPress={() => router.push("/geofencesetup")}
      >
        <Text style={styles.mapButtonText}>Next: Setup Geofencing</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 25, paddingTop: 60 },
  titleText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  itemCard: { 
    backgroundColor: '#111d15', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  itemPhoto: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  itemContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { color: 'white', fontSize: 18, fontWeight: '500' },
  deleteBtn: { padding: 8, marginLeft: 10 },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'center'
  },
  addButtonText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  mapButton: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, alignItems: 'center' },
  mapButtonText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 16 }
});