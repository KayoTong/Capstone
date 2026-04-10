import { checklistStore } from "@/src/store/checklistStore";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../src/styles/addItem.styles";

export default function AddItem() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const cameraRef = useRef<CameraView | null>(null);
  
  // States: 'choice' (menu), 'camera' (viewfinder), 'save' (preview)
  const [viewMode, setViewMode] = useState<'choice' | 'camera' | 'save'>('choice');

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setViewMode('save');
    }
  };

  if (!permission) return <View />;

  // --- CHOICE MENU (Matched to sage/grey-green theme) ---
  if (viewMode === 'choice' && !photoUri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#6B7D74" }]}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Item Photo</Text>
            <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#2ECC71', textAlign: 'center', marginBottom: 10 }}>
            Visual Record
          </Text>
          <Text style={{ color: 'white', textAlign: 'center', marginBottom: 40, fontSize: 16 }}>
            Choose how you want to add your item image.
          </Text>

          {/* Camera Card */}
          <TouchableOpacity 
            style={{ width: '100%', backgroundColor: '#12231A', borderRadius: 20, padding: 25, marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setViewMode('camera')}
          >
            <View style={{ backgroundColor: '#2ECC71', padding: 15, borderRadius: 15, marginRight: 20 }}>
              <Ionicons name="camera" size={30} color="white" />
            </View>
            <View>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Take Photo</Text>
              <Text style={{ color: '#95A5A6', fontSize: 14 }}>Use your camera now</Text>
            </View>
          </TouchableOpacity>

          {/* Gallery Card */}
          <TouchableOpacity 
            style={{ width: '100%', backgroundColor: '#12231A', borderRadius: 20, padding: 25, flexDirection: 'row', alignItems: 'center' }}
            onPress={pickImageFromGallery}
          >
            <View style={{ backgroundColor: '#2ECC71', padding: 15, borderRadius: 15, marginRight: 20 }}>
              <Ionicons name="images" size={30} color="white" />
            </View>
            <View>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>From Gallery</Text>
              <Text style={{ color: '#95A5A6', fontSize: 14 }}>Choose existing photo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 40 }}>
            <Text style={{ color: 'white', fontWeight: 'bold', textDecorationLine: 'underline' }}>CANCEL</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- CAMERA VIEW ---
  if (viewMode === 'camera' && !photoUri) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={styles.captureContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={async () => {
              const photo = await cameraRef.current?.takePictureAsync();
              if (photo?.uri) {
                setPhotoUri(photo.uri);
                setViewMode('save');
              }
            }}
          >
            <Ionicons name="camera" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- PREVIEW / SAVE VIEW ---
  return (
    <View style={[styles.container, { backgroundColor: "#6B7D74" }]}>
      <TouchableOpacity onPress={() => setViewMode('choice')}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>New Item</Text>

      <View style={styles.imageCircle}>
        <Image source={{ uri: photoUri! }} style={{ width: "100%", height: "100%", borderRadius: 100 }} />
      </View>

      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Work Keys"
        placeholderTextColor="#CCC"
        value={itemName}
        onChangeText={setItemName}
      />

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => {
          if (itemName.trim() && photoUri) {
            checklistStore.addItem(itemName, photoUri);
            router.push("/geofencesetup");
          }
        }}
      >
        <Text style={styles.saveBtnText}>Save Item</Text>
      </TouchableOpacity>
    </View>
  );
}