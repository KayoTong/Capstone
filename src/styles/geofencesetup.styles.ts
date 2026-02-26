import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0c", padding: 16, paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 15 },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  map: { height: 300, borderRadius: 20, marginBottom: 16 },
  loadingBox: { height: 300, justifyContent: "center", alignItems: "center", backgroundColor: "#111", borderRadius: 20, marginBottom: 16 },
  label: { color: "#fff", fontSize: 16, fontWeight: "500" },
  radiusText: { color: "#00ff88", fontSize: 18, fontWeight: "bold", marginVertical: 8 },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20, borderTopWidth: 1, borderTopColor: "#222" },
  saveButton: { backgroundColor: "#00ff88", padding: 18, borderRadius: 30, alignItems: "center", marginTop: "auto", marginBottom: 20 },
  saveText: { fontWeight: "bold", fontSize: 18, color: "#0b0f0c" },
});