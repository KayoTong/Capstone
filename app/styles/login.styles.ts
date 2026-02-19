// this is the styles file for the login screen
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 30, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 60, left: 25 },
  header: { marginBottom: 40 },
  title: { color: 'white', fontSize: 42, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 16, marginTop: 8 },
  form: { width: '100%' },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1a12', borderRadius: 15, marginBottom: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#1a2e21' },
  icon: { marginRight: 10 },
  input: { flex: 1, color: 'white', paddingVertical: 18, fontSize: 16 },
  mainBtn: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, alignItems: 'center', marginTop: 15 },
  btnText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 18 },
  signupBtn: { marginTop: 25, alignItems: 'center' },
  signupText: { color: '#888', fontSize: 15 },
  greenText: { color: '#2ECC71', fontWeight: 'bold' }
}); // styles for the login screen, including container, header, form, inputs, buttons, and back button