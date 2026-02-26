import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050c08', padding: 25, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backButton: { marginRight: 15 },
  titleText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  itemCard: { 
    backgroundColor: '#111d15', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  itemPhoto: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  itemContent: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { color: 'white', fontSize: 18, fontWeight: '500' },
  deleteBtn: { padding: 8, marginLeft: 10 },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: '#666', fontSize: 16 },
  addButton: {
    backgroundColor: '#2ECC71',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'center'
  },
  addButtonText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  mapButton: { backgroundColor: '#2ECC71', padding: 20, borderRadius: 15, alignItems: 'center' },
  mapButtonText: { color: '#0A1A10', fontWeight: 'bold', fontSize: 16 }
});
