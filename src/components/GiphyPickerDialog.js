import React, { useEffect, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Colors } from '../constants/Colors';
import useIsDark from '../hooks/useIsDark';
import AppDialog from './ui/AppDialog';
import PrimaryButton from './ui/PrimaryButton';
import SoftButton from './ui/SoftButton';

export default function GiphyPickerDialog({ visible, onClose, onSelect, isDark: isDarkProp }) {
  const isDark = useIsDark(isDarkProp);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setQuery('');
    setResults([]);
    setLoading(false);
  }, [visible]);

  const searchGiphy = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const apiKey = ''; // Configure at runtime; never commit API keys.
      const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query.trim())}&api_key=${apiKey}&limit=18`;
      const res = await fetch(url);
      const data = await res.json();
      setResults(Array.isArray(data?.data) ? data.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const inputChrome = [
    styles.searchInput,
    {
      backgroundColor: isDark ? 'rgba(2,6,23,0.35)' : 'rgba(255,255,255,0.80)',
      borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.10)',
      color: isDark ? Colors.textPrimaryDark : Colors.textPrimaryLight,
    },
  ];
  const placeholderTextColor = isDark ? 'rgba(226,232,240,0.45)' : 'rgba(15,23,42,0.45)';

  const emptyText = loading ? 'Searching…' : query.trim() ? 'No results found.' : 'Search for GIFs to insert.';

  return (
    <AppDialog
      visible={visible}
      onClose={onClose}
      isDark={isDark}
      title="GIF Picker"
      subtitle="Search and insert a GIF via GIPHY."
      icon="image-search-outline"
      maxWidth={980}
      footer={
        <View style={styles.footer}>
          <SoftButton label="CLOSE" onPress={onClose} isDark={isDark} />
        </View>
      }
    >
      <View style={styles.searchRow}>
        <TextInput
          style={[inputChrome, { flex: 1 }]}
          placeholder="Search GIFs…"
          placeholderTextColor={placeholderTextColor}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchGiphy}
          autoCorrect={false}
        />
        <PrimaryButton
          label={loading ? 'SEARCHING' : 'SEARCH'}
          icon="magnify"
          onPress={searchGiphy}
          loading={loading}
          disabled={!query.trim()}
          style={{ marginLeft: 10 }}
        />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {results.length ? (
          results.map((gif) => {
            const thumb = gif?.images?.fixed_height_small?.url;
            const original = gif?.images?.original?.url;
            if (!thumb || !original) return null;
            return (
              <Pressable
                key={gif.id}
                onPress={() => {
                  onSelect && onSelect(original);
                  onClose && onClose();
                }}
                style={[
                  styles.gifWrap,
                  {
                    backgroundColor: isDark ? 'rgba(2,6,23,0.30)' : 'rgba(255,255,255,0.70)',
                    borderColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.10)',
                  },
                  Platform.OS === 'web' ? { cursor: 'pointer' } : null,
                ]}
              >
                <Image source={{ uri: thumb }} style={styles.gifImg} />
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: isDark ? Colors.textSecondaryDark : Colors.textSecondaryLight }]}>
              {emptyText}
            </Text>
          </View>
        )}
      </ScrollView>
    </AppDialog>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  searchInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gifWrap: {
    width: 96,
    height: 96,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginRight: 10,
    marginBottom: 10,
  },
  gifImg: { width: '100%', height: '100%' },
  emptyWrap: { paddingVertical: 20, width: '100%' },
  emptyText: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'flex-end' },
});
