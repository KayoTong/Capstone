import { StyleSheet } from 'react-native';  

export const styles = StyleSheet.create({
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
