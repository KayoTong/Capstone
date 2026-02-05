import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Linking, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
// portable essentials dashboard screen
export default function Dashboard() {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());

  useEffect(() => {
    // Subscribe to store changes
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });

    return unsubscribe;
  }, []);

  const openMaps = () => {
    const url = `geo:40.7128,-74.0060?q=40.7128,-74.0060(Home)&mode=w`;
    Linking.openURL(url).catch(() => Linking.openURL(`https://maps.google.com`));
  };

  const handleToggle = (id: string) => {
    checklistStore.toggleItem(id);
  };

  const handleDelete = (id: string, itemName: string) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${itemName}"?`,       //ARE YOU SURE PROMPT FOR ITEM DELETION
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            checklistStore.removeItem(id);
          },
          style: "destructive",
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
            <Image
              source={{ uri: item.photoUri }}
              style={styles.itemPhoto}
            />
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
      <TouchableOpacity style={styles.mapButton} onPress={openMaps}>
        <Text style={styles.mapButtonText}>Return Home</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPhoto: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  itemContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemText: { color: 'white', fontSize: 18, fontWeight: '500' },
  deleteBtn: {
    padding: 8,
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#0A1A10',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  mapButton: { 
    backgroundColor: '#2ECC71', 
    padding: 20, 
    borderRadius: 15, 
    alignItems: 'center',
  },
  mapButtonText: { 
    color: '#0A1A10', 
    fontWeight: 'bold',
    fontSize: 16,
  }
});