import { ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions // Added to handle full-screen sizing
    ,


    FlatList,
    Image,
    Modal,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from "../src/styles/dashboard.styles";

const { width, height } = Dimensions.get('window');

export default function PortableEssentials() {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());
  
  // Modal States
  const [isRenameVisible, setIsRenameVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const unsubscribe = checklistStore.subscribe(() => {
      setItems([...checklistStore.getItems()]);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (id: string) => checklistStore.toggleItem(id);

  const openRenameModal = (id: string, currentName: string) => {
    setSelectedItem(items.find(i => i.id === id) || null);
    setNewName(currentName);
    setIsRenameVisible(true);
  };

  const openImagePreview = (item: ChecklistItem) => {
    setSelectedItem(item);
    setIsPreviewVisible(true);
  };

  const saveRename = () => {
    if (selectedItem && newName.trim().length > 0) {
      checklistStore.updateItem(selectedItem.id, newName.trim());
      setIsRenameVisible(false);
    }
  };

  return ( 
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.titleText}>Portable Essentials</Text>
          </View>
          
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                {item.photoUri && (
                  <TouchableOpacity onPress={() => openImagePreview(item)}>
                    <Image source={{ uri: item.photoUri }} style={styles.itemPhoto} />
                  </TouchableOpacity>
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
                <TouchableOpacity onPress={() => checklistStore.removeItem(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity style={styles.addButton} onPress={() => router.push("/addItem")}>
            <Ionicons name="add" size={28} color="white" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mapButton} onPress={() => router.push("/geofencesetup")}>
            <Text style={styles.mapButtonText}>Next: Setup Geofencing</Text>
          </TouchableOpacity>
        </View>

        {/* IMAGE PREVIEW MODAL */}
        <Modal visible={isPreviewVisible} transparent={true} animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }} 
              onPress={() => setIsPreviewVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
            
            {selectedItem?.photoUri && (
              <Image 
                source={{ uri: selectedItem.photoUri }} 
                style={{ width: width * 0.9, height: height * 0.6, borderRadius: 15 }} 
                resizeMode="contain" 
              />
            )}
            <Text style={{ color: 'white', marginTop: 20, fontSize: 20 }}>{selectedItem?.name}</Text>
          </View>
        </Modal>

        {/* RENAME MODAL */}
        <Modal visible={isRenameVisible} transparent={true} animationType="fade">
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
                <TouchableOpacity onPress={() => setIsRenameVisible(false)} style={{ marginRight: 20 }}>
                  <Text style={{ color: '#aaa' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveRename}>
                  <Text style={{ color: '#2ECC71', fontWeight: 'bold' }}>Save</Text>
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