import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Switch, Text, TouchableOpacity, View } from 'react-native';
import { styles } from "./styles/dashboard.styles";

export default function PortableEssentials() { // Main dashboard screen displaying user's checklist of portable essentials with options to toggle, delete, and navigate to add items or geofence setup
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());

  useEffect(() => { // Subscribe to store changes to keep UI in sync
    // Subscribe to store changes to keep UI in sync
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (id: string) => { // Toggle the active state of an item in the checklist
    checklistStore.toggleItem(id);
  };

  const handleDelete = (id: string, itemName: string) => { // Show confirmation alert before deleting an item from the checklist
    Alert.alert( // Show confirmation alert before deleting an item from the checklist
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

  return ( // Main dashboard screen displaying user's checklist of portable essentials with options to toggle, delete, and navigate to add items or geofence setup
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

// i removed styles and created dashboard.styles.ts to clean up the code and make it more modular. the styles are the same as before, just moved to a separate file.