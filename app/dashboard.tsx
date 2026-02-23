import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  Alert, 
  FlatList, 
  Image, 
  SafeAreaView, 
  Switch, 
  Text, 
  TouchableOpacity, 
  View, 
  Modal, 
  TextInput 
} from 'react-native';
import { styles } from "./styles/dashboard.styles";

export default function PortableEssentials() { // Main dashboard screen displaying user's checklist
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());
  
  // States for the Rename Modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => { // Subscribe to store changes to keep UI in sync
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (id: string) => { // Toggle the active state of an item
    checklistStore.toggleItem(id);
  };

  const openRenameModal = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
    setIsModalVisible(true);
  };

  const saveRename = () => {
    if (editingId && newName.trim().length > 0) {
      checklistStore.updateItem(editingId, newName.trim());
      setIsModalVisible(false);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string, itemName: string) => { // Show confirmation alert before deleting
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
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
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
                  <TouchableOpacity 
                    onPress={() => openRenameModal(item.id, item.name)}
                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                  >
                    <Text style={styles.itemText}>{item.name}</Text>
                    <Ionicons name="pencil" size={14} color="#2ECC71" style={{ marginLeft: 8 }} />
                  </TouchableOpacity>

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

          <TouchableOpacity 
            style={styles.mapButton} 
            onPress={() => router.push("/geofencesetup")}
          >
            <Text style={styles.mapButtonText}>Next: Setup Geofencing</Text>
          </TouchableOpacity>
        </View>

        {/* RENAME MODAL - Works on both Android and iOS */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#1e1e1e', width: '100%', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: '#333' }}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Rename Item</Text>
              <TextInput
                style={{ backgroundColor: '#333', color: 'white', padding: 12, borderRadius: 8, marginBottom: 20 }}
                value={newName}
                onChangeText={setNewName}
                autoFocus={true}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={{ marginRight: 20 }}>
                  <Text style={{ color: '#aaa', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveRename}>
                  <Text style={{ color: '#2ECC71', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
}
// i removed styles and created dashboard.styles.ts to clean up the code and make it more modular. the styles are the same as before, just moved to a separate file.