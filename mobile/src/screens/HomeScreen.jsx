import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getCatGradient, radius } from '../constants/theme';
import { fetchBreaking, fetchHero, fetchMostRead, fetchCategories, fetchPosts, MOCK } from '../api/wordpress';
import AppHeader from '../components/AppHeader';
import BreakingBanner from '../components/BreakingBanner';
import CategoryCircle from '../components/CategoryCircle';
import StoryRow from '../components/StoryRow';

const CatImage = ({ slug, style }) => {
  const g = getCatGradient(slug);
  return (
    <View style={[{ backgroundColor: g[1], overflow: 'hidden' }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: g[0], opacity: 0.35 }]} />
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState({
    breaking: MOCK.breaking,
    hero: MOCK.hero,
    categories: MOCK.categories,
    feed: [...MOCK.sucesos, ...MOCK.deportes, ...MOCK.tucupita].slice(0, 4),
    mostRead: MOCK.mostRead,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [breaking, hero, categories, mostRead, feed] = await Promise.allSettled([
        fetchBreaking(),
        fetchHero(),
        fetchCategories(),
        fetchMostRead(),
        fetchPosts({ perPage: 6 }),
      ]);
      setData({
        breaking: breaking.status === 'fulfilled' ? breaking.value : MOCK.breaking,
        hero:     hero.status === 'fulfilled' ? hero.value : MOCK.hero,
        categories: categories.status === 'fulfilled' ? categories.value : MOCK.categories,
        mostRead: mostRead.status === 'fulfilled' ? mostRead.value : MOCK.mostRead,
        feed:     feed.status === 'fulfilled' ? feed.value.posts : [...MOCK.sucesos, ...MOCK.deportes],
      });
      setLoading(false);
    }
    load();
  }, []);

  const hero = data.hero[0] || MOCK.hero[0];

  return (
    <View style={[styles.screen, { paddingBottom: 110 }]}>
      <AppHeader
        greeting="Buenos días"
        onSearchPress={() => navigation.navigate('Search')}
      />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Breaking ribbon */}
        <BreakingBanner items={data.breaking} />

        {/* Stories rail — categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesRail}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {data.categories.map((c, i) => (
            <CategoryCircle key={c.slug} category={c} active={i === 0} />
          ))}
        </ScrollView>

        {/* Hero card */}
        <TouchableOpacity
          style={styles.heroWrap}
          onPress={() => navigation.navigate('Article', { slug: hero.slug || hero.id, post: hero })}
          activeOpacity={0.9}
        >
          <View style={styles.heroCard}>
            {hero.imgUrl
              ? <Image source={{ uri: hero.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              : <CatImage slug={hero.img || hero.catSlug} style={StyleSheet.absoluteFill} />
            }
            {/* Gradient overlay */}
            <View style={styles.heroOverlay} />

            {/* Content */}
            <View style={styles.heroContent}>
              <View style={styles.heroBadges}>
                <View style={styles.chipVivid}>
                  <Text style={styles.chipVividText}>{hero.cat}</Text>
                </View>
                <View style={styles.chipGhost}>
                  <Text style={styles.chipGhostText}>Destacada</Text>
                </View>
              </View>
              <Text style={styles.heroTitle} numberOfLines={3}>{hero.title}</Text>
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaText}>{hero.author}</Text>
                <Text style={styles.heroMetaDot}>·</Text>
                <Text style={styles.heroMetaText}>{hero.date}</Text>
                <Text style={styles.heroMetaDot}>·</Text>
                <Text style={styles.heroMetaText}>{hero.readTime}</Text>
              </View>
            </View>

            {/* Bookmark button */}
            <TouchableOpacity style={styles.bookmarkBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 4h12v17l-6-4-6 4z"/>
              </svg>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {/* Section header */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            Para <Text style={{ fontStyle: 'italic', color: colors.green }}>ti</Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.sectionAction}>Personalizar</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <View style={styles.feed}>
          {data.feed.map((s, i) => (
            <TouchableOpacity
              key={s.id}
              style={styles.feedItem}
              onPress={() => navigation.navigate('Article', { slug: s.slug || s.id, post: s })}
              activeOpacity={0.8}
            >
              <View style={styles.feedText}>
                <Text style={styles.feedCat}>{s.cat}</Text>
                <Text style={styles.feedTitle} numberOfLines={2}>{s.title}</Text>
                <View style={styles.feedMeta}>
                  <Text style={styles.feedMetaText}>{s.date}</Text>
                  <Text style={styles.feedMetaDot}>·</Text>
                  <Text style={styles.feedMetaText}>{s.readTime || '3 min'}</Text>
                </View>
              </View>
              {s.imgUrl
                ? <Image source={{ uri: s.imgUrl }} style={styles.feedThumb} resizeMode="cover" />
                : <CatImage slug={s.img || s.catSlug} style={styles.feedThumb} />
              }
            </TouchableOpacity>
          ))}
        </View>

        {/* Most read */}
        <View style={styles.section}>
          <View style={styles.mostReadHeader}>
            <Text style={styles.mostReadTitle}>
              Lo más <Text style={{ fontStyle: 'italic', color: colors.green }}>leído</Text>
            </Text>
          </View>
          {data.mostRead.slice(0, 4).map((s, i) => (
            <StoryRow
              key={s.id}
              story={s}
              index={i + 1}
              onPress={() => navigation.navigate('Article', { slug: s.slug || s.id, post: s })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scroll: {
    flex: 1,
  },
  categoriesRail: {
    marginBottom: 18,
  },
  heroWrap: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  heroCard: {
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.ink,
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    // approximates gradient (180deg, transparent 30%, rgba(0,0,0,0.9) 100%)
  },
  heroContent: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 20,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  chipVivid: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.greenVivid,
  },
  chipVividText: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.ink,
  },
  chipGhost: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipGhostText: {
    fontSize: 9, fontWeight: '600', letterSpacing: 1.2,
    textTransform: 'uppercase', color: 'white',
  },
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    lineHeight: 28,
    color: 'white',
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroMetaText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  heroMetaDot: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  bookmarkBtn: {
    position: 'absolute',
    top: 14, right: 14,
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionRow: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  sectionAction: {
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  feed: {
    paddingHorizontal: 20,
  },
  feedItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  feedText: {
    flex: 1,
  },
  feedCat: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.green, marginBottom: 6,
  },
  feedTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 16,
    lineHeight: 20,
    color: colors.ink,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  feedMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedMetaText: { fontSize: 11, color: colors.inkFaint },
  feedMetaDot: { fontSize: 11, color: colors.inkFaint },
  feedThumb: {
    width: 100, height: 100, borderRadius: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  mostReadHeader: {
    borderTopWidth: 2,
    borderTopColor: colors.ink,
    paddingTop: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mostReadTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
  },
});
