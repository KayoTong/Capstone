import { checklistStore } from "@/src/store/checklistStore";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera"; // we are adding camera functionality
import { useRouter } from "expo-router";
import { useRef, useState } from "react"; // we will use useRef to reference the camera component and useState to manage state
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddItem() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions(); // request camera permissions
  const [photoUri, setPhotoUri] = useState<string | null>(null); // state to hold the captured photo URI
  const [itemName, setItemName] = useState(""); // state to hold the item name
  const cameraRef = useRef<CameraView | null>(null); // reference to the camera component
  const [showCamera, setShowCamera] = useState(false); // state to toggle camera view

  if (!permission) { // permission is still loading
    return <View />;
  }

  if (!permission.granted) { // if permission is not granted, show a message and button to request permission
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Camera access is required to add an item.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={styles.permissionBtn}
        >
          <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!photoUri) { // if no photo is taken yet, show the camera view
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

        {/* Capture button */} 
        <View style={styles.captureContainer}> 
          <TouchableOpacity
            style={styles.captureButton}
            onPress={async () => {
              const photo = await cameraRef.current?.takePictureAsync();
              if (photo?.uri) {
                setPhotoUri(photo.uri);
              }
            }}
          >
            <Ionicons name="camera" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  // If photo is taken, show the preview with option to retake
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>New Item</Text>

      <View style={styles.imageCircle}>
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <TouchableOpacity
            style={styles.cameraIcon}
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="camera" size={20} color="black" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Work Keys"
        placeholderTextColor="#555"
        value={itemName}
        onChangeText={setItemName}
      />

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={() => {
          if (itemName.trim() && photoUri) {
            checklistStore.addItem(itemName, photoUri);
            router.push("/dashboard");
          }
        }}
      >
        <Text style={styles.saveBtnText}>Save Item</Text>
      </TouchableOpacity>
    </View>
  );
} // End of AddItem component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050c08",
    padding: 25,
    paddingTop: 50,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  imageCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#111d15",
    alignSelf: "center",
    marginTop: 40,
    overflow: "hidden",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 10,
    backgroundColor: "#2ECC71",
    padding: 8,
    borderRadius: 15,
  },

  label: { color: "white", marginTop: 30, fontSize: 16 },
  input: {
    backgroundColor: "#111d15",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },

  saveBtn: {
    backgroundColor: "#2ECC71",
    padding: 20,
    borderRadius: 15,
    marginTop: "auto",
    alignItems: "center",
  },
  saveBtnText: { fontWeight: "bold", fontSize: 18, color: "#000" },

  permissionContainer: {
    flex: 1,
    backgroundColor: "#050c08",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  permissionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  permissionBtn: {
    backgroundColor: "#2ECC71",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
  permissionBtnText: { color: "#000", fontWeight: "bold", fontSize: 16 },

  captureContainer: { position: "absolute", bottom: 40, alignSelf: "center" },
  captureButton: {
    backgroundColor: "#2ECC71",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },

  retakeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  retakeText: {
    color: "#2ECC71",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
});
