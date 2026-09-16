// ProjectsLibraryScreen (React Native)
import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import SaveToLibraryDialog from '../components/SaveToLibraryDialog';
import { useLibrary } from '../providers/LibraryProvider';
import { useProject } from '../context/ProjectContext';

const ProjectsLibraryScreen = () => {
  const { projects, deleteProject, saveProject } = useLibrary();
  const { exportToJson, importFromJson } = useProject();
  const [search, setSearch] = useState('');
  const [showSave, setShowSave] = useState(false);

  const filtered = useMemo(
    () => projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const handleLoad = (project) => {
    importFromJson(project.jsonContent);
    Alert.alert('Loaded', 'Project loaded into workspace.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects Library</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.btn} onPress={() => setShowSave(true)}>
          <Text style={styles.btnText}>Save current project</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Search projects..."
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <TouchableOpacity onPress={() => deleteProject(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardSubtitle}>{item.description || 'No description'}</Text>
            {item.tags?.length ? <Text style={styles.tags}>Tags: {item.tags.join(', ')}</Text> : null}
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => handleLoad(item)}>
                <Text style={styles.smallBtnText}>Load</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No projects found.</Text>}
      />
      <SaveToLibraryDialog
        visible={showSave}
        onClose={() => setShowSave(false)}
        onSave={(payload) => {
          saveProject({ name: payload.name, description: payload.desc, tags: payload.tags || [], jsonContent: exportToJson() });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  btn: { backgroundColor: '#6366F1', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 4 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 16, borderWidth: 1, borderColor: '#ddd' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#475569', marginTop: 4 },
  tags: { color: '#64748B', fontSize: 12, marginTop: 6 },
  cardActions: { flexDirection: 'row', marginTop: 12 },
  smallBtn: { backgroundColor: '#EEF2FF', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12 },
  smallBtnText: { color: '#4338CA', fontWeight: '700' },
  deleteText: { color: '#EF4444', fontWeight: '700', fontSize: 12 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 24 },
});

export default ProjectsLibraryScreen;
