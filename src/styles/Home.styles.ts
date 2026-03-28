// im going to refactor home.tsx and put its styles components in this file to make it cleaner and more organized.
import { StyleSheet } from "react-native";
// is this the ui for home.tsx? if so, we can move all the styles here to keep the home.tsx file cleaner and 
// more focused on the logic and structure of the component. 
// we can export the styles object from this file and i
// mport it in home.tsx to use the styles there. this way,
//  we separate the concerns of styling and component logic, making it easier to maintain and read both files.
export const styles = StyleSheet.create({ // styles for the home screen, including header, status, alerts, stats, and checklist items
container: { flex: 1, backgroundColor: '#6B7A74' },
  scrollContent: { padding: 20, paddingBottom: 160 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoBox: { backgroundColor: '#2ECC71', width: 45, height: 45, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoText: { fontSize: 24, fontWeight: '900', color: '#2ECC71' },
  profileCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#f0e0d0' },
  mainTitle: { fontSize: 34, fontWeight: 'bold', color: '#fff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 25 },
  locationText: { color: '#fff', fontSize: 16 },
  divider: { marginHorizontal: 8, color: '#ccc' },
  activeBadge: { flexDirection: 'row', alignItems: 'center' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ECC71', marginRight: 6 },
  activeText: { color: '#2ECC71', fontWeight: 'bold', fontSize: 16 },
  alertCard: { borderRadius: 24, padding: 20, borderLeftWidth: 6, marginBottom: 25, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  alertHeader: { flexDirection: 'row', alignItems: 'center' },
  alertIconBg: { padding: 12, backgroundColor: '#fff', borderRadius: 15, marginRight: 15 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', color: "#2ECC71" },
  alertSub: { fontSize: 14, color: '#95a5a6' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionLabel: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  viewAll: { color: '#2ECC71', fontWeight: 'bold' },
  statsGrid: { color: '#',flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { backgroundColor: '#12231A', width: '31%', padding: 20, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#f1f1f1' },
  statCount: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#95a5a6' },
  itemRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 18, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: '#f8f8f8' },
  itemIconBg: { width: 55, height: 55, borderRadius: 18, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemImage: { width: '100%', height: '100%', borderRadius: 18 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  itemStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 5 },
  smallDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  itemStatusText: { fontSize: 13, fontWeight: 'bold' },
  menuContainer: { backgroundColor: '#12231A', borderRadius: 24, borderWidth: 1, borderColor: '#f1f1f1', overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  menuText: { fontSize: 17, fontWeight: 'bold', color: '#2ECC71' },
  menuSubText: { fontSize: 13, color: '#95a5a6' },
  fab: { position: 'absolute', bottom: 120, right: 25, width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#2ECC71', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  tabBarWrapper: { position: 'absolute', bottom: 0, width: '100%', height: 110 },
  tabBar: { flex: 1, backgroundColor: '#6B7A74', borderTopLeftRadius: 40, borderTopRightRadius: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#6B7A74' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 14, color: '#aaa' },

});



