import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getCatGradient, radius } from '../constants/theme';
import { searchPosts } from '../api/wordpress';

const SUGGESTIONS = [
  'Tucupita patroleo de calles',
  'Tucupita Saime sede',
  'Tucupita por puestos pasaje',
  'Tucupita alcaldía',
];

const CatImage = ({ slug, style }) => {
  const g = getCatGradient(slug);
  return <View style={[{ backgroundColor: g[1] }, style]} />;
};

export default function SearchScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(route?.params?.query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) { setResults([]); return; }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const r = await searchPosts(query.trim());
      setResults(r);
      setLoading(false);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Atrás</Text>
        </TouchableOpacity>
        <View style={styles.searchInput}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar…"
            placeholderTextColor={colors.inkFaint}
            style={styles.input}
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.scroll} keyboardDismissMode="on-drag">
        {/* Suggestions when no query */}
        {!query && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sugerencias</Text>
            {SUGGESTIONS.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.suggestion}
                onPress={() => setQuery(s)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.inkFaint} strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                </svg>
                <Text style={styles.suggestionText}>{s}</Text>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.inkFaint} strokeWidth="2" strokeLinecap="round">
                  <path d="M7 17 17 7M9 7h8v8"/>
                </svg>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Results */}
        {results.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line }]}>
            <Text style={styles.sectionLabel}>Resultados — {results.length} notas</Text>
            {results.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.result}
                onPress={() => navigation.navigate('Article', { slug: s.slug || s.id, post: s })}
                activeOpacity={0.8}
              >
                <View style={styles.resultText}>
                  <Text style={styles.resultCat}>{s.cat}</Text>
                  <Text style={styles.resultTitle} numberOfLines={2}>{s.title}</Text>
                  <Text style={styles.resultDate}>{s.date}</Text>
                </View>
                {s.imgUrl
                  ? <Image source={{ uri: s.imgUrl }} style={styles.resultThumb} resizeMode="cover" />
                  : <CatImage slug={s.img || s.catSlug} style={styles.resultThumb} />
                }
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* No results */}
        {query.length >= 2 && !loading && results.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontStyle: 'italic', fontSize: 22, color: colors.inkMuted }}>
              Sin resultados
            </Text>
            <Text style={{ fontSize: 14, color: colors.inkFaint, marginTop: 8, textAlign: 'center' }}>
              No encontramos notas para "{query}".
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backBtn: {
    marginBottom: 12,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.green,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.green,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  cancelText: {
    fontSize: 13,
    color: colors.inkMuted,
  },
  scroll: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginBottom: 10,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  result: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  resultText: {
    flex: 1,
    gap: 4,
  },
  resultCat: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.green,
  },
  resultTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
    letterSpacing: -0.2,
  },
  resultDate: {
    fontSize: 11,
    color: colors.inkFaint,
  },
  resultThumb: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
});
