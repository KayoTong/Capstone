import { Category, ChecklistItem, checklistStore } from '@/src/store/checklistStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    SectionList // Swapped FlatList for SectionList
    ,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/services/themeService';
import { styles } from "../../src/styles/dashboard.styles";

const { width, height } = Dimensions.get('window');

export default function PortableEssentials() {
  const router = useRouter();
  const { theme } = useTheme();
  const [items, setItems] = useState<ChecklistItem[]>(checklistStore.getItems());
  
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

  // Helper to group items into sections for the SectionList
  const getSections = () => {
    const categories: Category[] = ['Essentials', 'Tech', 'Extra Layers', 'Toiletries', 'Other'];
    return categories
      .map(cat => ({
        title: cat.toUpperCase(),
        data: items.filter(item => item.category === cat)
      }))
      .filter(section => section.data.length > 0); // Only show categories that have items
  };

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

      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
        <View style={{ flex: 1 }}>
          <View style={[styles.header, { borderBottomColor: theme.border, borderBottomWidth: 1, paddingBottom: 10 }]}> 
            <Text style={[styles.titleText, { color: theme.text }]}>My Items</Text>
          </View>
          
          <SectionList
            sections={getSections()}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section: { title } }) => (
              <View style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
                <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 14, letterSpacing: 1 }}>
                  {title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={[
                styles.itemCard,
                { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
                item.isCritical && { borderLeftWidth: 4, borderLeftColor: theme.accent }
              ]}>
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
                    <Text style={[styles.itemText, { color: theme.text }]}>{item.name}</Text>
                    {item.isCritical && (
                      <Ionicons name="alert-circle" size={16} color={theme.accent} style={{ marginLeft: 5 }} />
                    )}
                    <Ionicons name="pencil" size={14} color={theme.accent} style={{ marginLeft: 8 }} />
                  </TouchableOpacity>
                  <Switch 
                    value={item.active} 
                    onValueChange={() => handleToggle(item.id)}
                    trackColor={{ false: theme.border, true: theme.accent }} 
                    thumbColor={item.active ? theme.accent : theme.surface}
                  />
                </View>
                <TouchableOpacity onPress={() => checklistStore.removeItem(item.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.accent }]} onPress={() => router.push("/addItem")}>
            <Ionicons name="add" size={28} color={theme.surface} />
            <Text style={[styles.addButtonText, { color: theme.surface }]}>Add Item</Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview Modal */}
        <Modal visible={isPreviewVisible} transparent={true} animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity 
              style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }} 
              onPress={() => setIsPreviewVisible(false)}
            >
              <Ionicons name="close-circle" size={40} color={theme.text} />
            </TouchableOpacity>
            {selectedItem?.photoUri && (
              <Image
                source={{ uri: selectedItem.photoUri }}
                style={{ width: width * 0.9, height: height * 0.6, borderRadius: 15 }}
                resizeMode="contain"
              />
            )}
            <Text style={{ color: theme.text, marginTop: 20, fontSize: 20 }}>{selectedItem?.name}</Text>
          </View>
        </Modal>

        {/* Rename Modal */}
        <Modal visible={isRenameVisible} transparent={true} animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: theme.surface, width: '100%', borderRadius: 15, padding: 20, borderWidth: 1, borderColor: theme.border }}>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Rename Item</Text>
              <TextInput
                style={{ backgroundColor: theme.card, color: theme.text, padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}
                value={newName}
                onChangeText={setNewName}
                autoFocus={true}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setIsRenameVisible(false)} style={{ marginRight: 20 }}>
                  <Text style={{ color: theme.subText }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveRename}>
                  <Text style={{ color: theme.accent, fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
} // i removed styles and created dashboard.styles.ts to clean up the code and make it more modular. the styles are the same as before, just moved to a separate file.