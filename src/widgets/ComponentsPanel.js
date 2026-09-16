// ComponentsPanel for React Native (stub)
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

export default function ComponentsPanel() {
  const [search, setSearch] = React.useState('');
  // TODO: Render list of components/snippets, filter by search
  return (
    <View style={styles.panel}>
      <TextInput
        style={styles.input}
        placeholder="Search components..."
        value={search}
        onChangeText={setSearch}
      />
      <Text>Component list goes here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { padding: 16, backgroundColor: '#f5f5f5', flex: 1 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 8, marginBottom: 12 },
});
