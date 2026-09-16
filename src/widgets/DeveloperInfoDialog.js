// DeveloperInfoDialog for React Native (modal with tabs)
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DeveloperInfoDialog({ visible, onClose }) {
  const [tab, setTab] = useState(0);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.tabs}>
            {['About', 'Contact', 'Credits'].map((label, idx) => (
              <TouchableOpacity key={label} onPress={() => setTab(idx)} style={[styles.tab, tab === idx && styles.activeTab]}>
                <Text style={styles.tabText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.content}>
            {tab === 0 && <Text>About the developer...</Text>}
            {tab === 1 && <Text>Contact info...</Text>}
            {tab === 2 && <Text>Credits...</Text>}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}><Text style={styles.closeText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  dialog: { backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 320, maxWidth: '90%' },
  tabs: { flexDirection: 'row', marginBottom: 16 },
  tab: { flex: 1, padding: 8, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { fontWeight: 'bold', fontSize: 16 },
  content: { minHeight: 80, marginBottom: 16 },
  closeBtn: { alignSelf: 'flex-end', marginTop: 8 },
  closeText: { color: '#2196F3', fontWeight: 'bold' },
});
