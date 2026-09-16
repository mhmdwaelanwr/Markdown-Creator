// GalleryScreen (React Native)
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useProject } from '../context/ProjectContext';
import ConfirmDialog from '../components/ConfirmDialog';

const GalleryScreen = () => {
  const { allTemplates, loadTemplate } = useProject();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    setShowConfirm(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Design Showcase</Text>
      <FlatList
        data={allTemplates}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No templates found.</Text>}
      />
      <ConfirmDialog
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          if (selectedTemplate) loadTemplate(selectedTemplate);
          setShowConfirm(false);
        }}
        title="Load template"
        message="This will replace your current workspace. Continue?"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { color: '#475569' },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 24 },
});

export default GalleryScreen;
