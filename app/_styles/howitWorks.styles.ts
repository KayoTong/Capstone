import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({ // Styles for the How It Works screen, defining layout, typography, and UI elements
  container: { flex: 1, backgroundColor: '#fff', padding: 25 }, // Main container with padding
  scrollContent: { paddingTop: 60, paddingBottom: 140 }, // ScrollView content padding to create space at top and bottom
  titleText: { color: '#0A3D2E', fontSize: 32, fontWeight: 'bold', textAlign: 'center' }, // Title styling with color, size, weight, and center alignment
  subtitleText: { color: '#888', textAlign: 'center', marginBottom: 40 }, // Subtitle styling with color, center alignment, and bottom margin
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 }, // Row layout for each step with spacing between them
  numberCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#0A3D2E', justifyContent: 'center', alignItems: 'center' },
  numberText: { fontWeight: 'bold', color: '#0A3D2E' }, // Styling for the step number circle and text
  stepTextContent: { marginLeft: 15, flex: 1 }, // Container for step text with left margin and flexible width
  stepTitle: { fontWeight: 'bold', color: '#0A3D2E', fontSize: 18 },// Styling for the step title with bold weight, color, and size
  stepDesc: { color: '#666', marginTop: 5 }, // Styling for the step description with color and top margin
  imagePlaceholder: {  // Placeholder for the image showing the UI, styled with background color, border, and layout properties
    width: '100%',  // Full width of the container  
    height: 250, // Increased to 250 so "cover" mode shows more of the items
    backgroundColor: '#fbfbfb', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 40, 
    overflow: 'hidden',
    borderWidth: 1, 
    borderColor: '#eee' 
  },
  fullImage: { width: '100%', height: '100%' },
  uiCard: { backgroundColor: '#fff', width: '85%', borderRadius: 12, padding: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  uiRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  uiText: { flex: 1, marginLeft: 10, color: '#0A3D2E', fontWeight: '500' },
  uiSwitchActive: { width: 40, height: 22, backgroundColor: '#2ECC71', borderRadius: 11 },
  uiDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 4 },
  startBtn: { backgroundColor: '#0A3D2E', padding: 20, borderRadius: 30, flexDirection: 'row', alignItems: 'center', position: 'absolute', bottom: 30, left: 25, right: 25 },
  btnNumber: { backgroundColor: '#E8F5E9', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  startBtnText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});