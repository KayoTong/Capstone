import { Category, checklistStore } from "@/src/store/checklistStore";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../src/styles/addItem.styles";

export default function AddItem() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Essentials");
  const [isCritical, setIsCritical] = useState(false);

  const cameraRef = useRef<CameraView | null>(null);
  const [viewMode, setViewMode] = useState<"choice" | "camera" | "save">(
    "choice",
  );

  const categories: Category[] = [
    "Essentials",
    "Tech",
    "Extra Layers",
    "Toiletries",
    "Other",
  ];

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Gallery access is required.");
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
      setViewMode("save");
    }
  };

  if (!permission) return <View />;

  if (viewMode === "choice" && !photoUri) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#6B7D74" }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Item Photo</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: "#2ECC71",
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            Visual Record
          </Text>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              marginBottom: 40,
              fontSize: 16,
            }}
          >
            Capture your item to add it to your checklist.
          </Text>

          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: "#12231A",
              borderRadius: 20,
              padding: 25,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => setViewMode("camera")}
          >
            <View
              style={{
                backgroundColor: "#2ECC71",
                padding: 15,
                borderRadius: 15,
                marginRight: 20,
              }}
            >
              <Ionicons name="camera" size={30} color="white" />
            </View>
            <View>
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Take Photo
              </Text>
              <Text style={{ color: "#95A5A6", fontSize: 14 }}>
                Use your camera
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: "100%",
              backgroundColor: "#12231A",
              borderRadius: 20,
              padding: 25,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={pickImageFromGallery}
          >
            <View
              style={{
                backgroundColor: "#2ECC71",
                padding: 15,
                borderRadius: 15,
                marginRight: 20,
              }}
            >
              <Ionicons name="images" size={30} color="white" />
            </View>
            <View>
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                From Gallery
              </Text>
              <Text style={{ color: "#95A5A6", fontSize: 14 }}>
                Choose existing photo
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginTop: 40 }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
                textDecorationLine: "underline",
              }}
            >
              CANCEL
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (viewMode === "camera" && !photoUri) {
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
                setViewMode("save");
              }
            }}
          >
            <Ionicons name="camera" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#6B7D74" }]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        <TouchableOpacity
          onPress={() => setViewMode("choice")}
          style={{ marginBottom: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { marginBottom: 20 }]}>
          Item Details
        </Text>

        <View
          style={[
            styles.imageCircle,
            { alignSelf: "center", marginBottom: 25 },
          ]}
        >
          <Image
            source={{ uri: photoUri! }}
            style={{ width: "100%", height: "100%", borderRadius: 100 }}
          />
        </View>

        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Laptop"
          placeholderTextColor="#CCC"
          value={itemName}
          onChangeText={setItemName}
        />

        <Text style={[styles.label, { marginTop: 15 }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 20 }}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                backgroundColor:
                  selectedCategory === cat ? "#2ECC71" : "#12231A",
                paddingHorizontal: 15,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 10,
                borderWidth: 1,
                borderColor: "#2ECC71",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: selectedCategory === cat ? "bold" : "normal",
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Priority Toggle - No family mention, just priority */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#12231A",
            padding: 15,
            borderRadius: 12,
            marginBottom: 25,
          }}
        >
          <View>
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
              High Priority
            </Text>
            <Text style={{ color: "#95A5A6", fontSize: 12 }}>
              Triggers urgent alerts on your phone
            </Text>
          </View>
          <Switch
            value={isCritical}
            onValueChange={setIsCritical}
            trackColor={{ false: "#333", true: "#2ECC71" }}
            thumbColor={isCritical ? "#fff" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: itemName.trim() ? "#2ECC71" : "#454d48" },
          ]}
          disabled={!itemName.trim()}
          onPress={() => {
            if (itemName.trim() && photoUri) {
              checklistStore.addItem(
                itemName,
                photoUri,
                selectedCategory,
                isCritical,
              );
              router.back();
            }
          }}
        >
          <Text style={styles.saveBtnText}>Save to Checklist</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
