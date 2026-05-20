import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getCatGradient, radius } from '../constants/theme';
import { fetchCategories, fetchMostRead, MOCK } from '../api/wordpress';

const TRENDING = ['#Tucupita', '#LoaTamaronis', '#Deportes2026', '#LácteosDelta', '#Sucesos', '#TenisDeMesa', '#Caracas', '#PlanQuirúrgico'];

const CatBox = ({ category, onPress }) => {
  const g = getCatGradient(category.slug);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.catBox}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: g[1] }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: g[0], opacity: 0.4 }]} />
      </View>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]} />
      <View style={styles.catBoxContent}>
        <Text style={styles.catBoxCount}>{Math.floor(Math.random() * 30 + 12)} notas</Text>
        <Text style={styles.catBoxName}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ExploreScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState(MOCK.categories);
  const [mostRead, setMostRead] = useState(MOCK.mostRead);

  useEffect(() => {
    Promise.allSettled([fetchCategories(), fetchMostRead()]).then(([cats, mr]) => {
      if (cats.status === 'fulfilled') setCategories(cats.value);
      if (mr.status === 'fulfilled') setMostRead(mr.value);
    });
  }, []);

  return (
    <ScrollView
      style={[styles.screen]}
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 20 }}>
        <Text style={styles.pageTitle}>
          Explorar{'\n'}<Text style={styles.pageTitleGreen}>el delta</Text>
        </Text>

        {/* Search field */}
        <TouchableOpacity
          style={styles.searchField}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.inkMuted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <Text style={styles.searchPlaceholder}>Buscar noticias, autores, lugares…</Text>
          <View style={styles.searchKbd}>
            <Text style={styles.searchKbdText}>⌘ K</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Trending tags */}
      <View style={styles.section}>
        <View style={styles.trendingHeader}>
          <Text style={styles.trendingFire}>🔥</Text>
          <Text style={styles.trendingLabel}>Trending esta semana</Text>
        </View>
        <View style={styles.tagsWrap}>
          {TRENDING.map((t, i) => (
            <TouchableOpacity
              key={t}
              onPress={() => navigation.navigate('Search', { query: t.replace('#', '') })}
              style={[styles.tag, i === 0 && styles.tagActive]}
            >
              <Text style={[styles.tagText, i === 0 && styles.tagTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Categories grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Por <Text style={{ fontStyle: 'italic', color: colors.green }}>sección</Text>
        </Text>
        <View style={styles.catGrid}>
          {categories.map(c => (
            <CatBox key={c.slug} category={c} onPress={() => {}} />
          ))}
        </View>
      </View>

      {/* Most read */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Más <Text style={{ fontStyle: 'italic', color: colors.green }}>leído</Text>
        </Text>
        {mostRead.slice(0, 4).map((s, i) => (
          <TouchableOpacity
            key={s.id}
            style={styles.mostReadItem}
            onPress={() => navigation.navigate('Article', { slug: s.slug || s.id, post: s })}
            activeOpacity={0.8}
          >
            <Text style={styles.mostReadIndex}>{i + 1}</Text>
            <View style={styles.mostReadText}>
              <Text style={styles.mostReadCat}>{s.cat}</Text>
              <Text style={styles.mostReadTitle} numberOfLines={2}>{s.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 36,
    lineHeight: 38,
    letterSpacing: -1,
    color: colors.ink,
    marginBottom: 18,
  },
  pageTitleGreen: {
    fontStyle: 'italic',
    color: colors.green,
  },
  searchField: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 0,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: colors.inkFaint,
  },
  searchKbd: {
    backgroundColor: colors.line,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  searchKbdText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.inkMuted,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trendingFire: { fontSize: 14 },
  trendingLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tagActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.ink,
  },
  tagTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catBox: {
    width: '48%',
    height: 92,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  catBoxContent: {
    position: 'absolute',
    inset: 0,
    padding: 14,
    justifyContent: 'space-between',
  },
  catBoxCount: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
  },
  catBoxName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    lineHeight: 26,
    color: 'white',
  },
  mostReadItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    alignItems: 'flex-start',
  },
  mostReadIndex: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    color: colors.green,
    fontSize: 28,
    lineHeight: 28,
    width: 28,
    textAlign: 'center',
  },
  mostReadText: { flex: 1, gap: 4 },
  mostReadCat: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.inkMuted,
  },
  mostReadTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
    letterSpacing: -0.2,
  },
});
