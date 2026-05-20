import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getCatGradient, radius } from '../constants/theme';
import { fetchPost, fetchPosts, MOCK } from '../api/wordpress';

const CatImage = ({ slug, style }) => {
  const g = getCatGradient(slug);
  return (
    <View style={[{ backgroundColor: g[1] }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: g[0], opacity: 0.35 }]} />
    </View>
  );
};

export default function ArticleScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { slug, post: initialPost } = route?.params || {};
  const [article, setArticle] = useState(initialPost || MOCK.article);
  const [related, setRelated] = useState([]);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    fetchPost(slug).then(a => { if (a) setArticle(a); });
    fetchPosts({ perPage: 3 }).then(r => setRelated(r.posts));
  }, [slug]);

  const a = article;

  // Key points from body
  const keyPoints = (a.body || []).filter(b => b.type === 'p').slice(0, 3).map((b, i) => ({
    num: `0${i + 1}`,
    text: b.text.slice(0, 100) + (b.text.length > 100 ? '…' : ''),
  }));

  return (
    <View style={[styles.screen]}>
      {/* Reading progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${readProgress}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        onScroll={e => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const progress = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
          setReadProgress(Math.max(0, Math.min(100, progress)));
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          {a.imgUrl || a.imgFull
            ? <Image source={{ uri: a.imgFull || a.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <CatImage slug={a.img || a.catSlug} style={StyleSheet.absoluteFill} />
          }
          {/* Gradient overlay */}
          <View style={styles.heroGradient} />

          {/* Top bar */}
          <View style={[styles.heroTopBar, { marginTop: insets.top + 12 }]}>
            <TouchableOpacity style={styles.circleBtn} onPress={() => navigation.goBack()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 6-6 6 6 6"/>
              </svg>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={styles.circleBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4h12v17l-6-4-6 4z"/>
                </svg>
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 12h.01M12 12h.01M18 12h.01"/>
                </svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom text */}
          <View style={styles.heroBottom}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>{a.cat}</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={4}>{a.title}</Text>
            {a.deck && <Text style={styles.heroDeck} numberOfLines={3}>{a.deck}</Text>}
          </View>
        </View>

        {/* Author bar */}
        <View style={styles.authorBar}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>{(a.author || 'T').charAt(0)}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{a.author}</Text>
            <Text style={styles.authorMeta}>{a.date} · {a.readTime}</Text>
          </View>
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followBtnText}>Seguir</Text>
          </TouchableOpacity>
        </View>

        {/* Key points box */}
        {keyPoints.length > 0 && (
          <View style={styles.keyPoints}>
            <View style={styles.keyPointsHeader}>
              <View style={styles.keyPointsStar}><Text style={styles.keyPointsStarText}>★</Text></View>
              <Text style={styles.keyPointsLabel}>Lo esencial</Text>
            </View>
            {keyPoints.map(({ num, text }) => (
              <View key={num} style={styles.keyPointItem}>
                <Text style={styles.keyPointNum}>{num}</Text>
                <Text style={styles.keyPointText}>{text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Body */}
        <View style={styles.body}>
          {(a.body || []).map((b, i) => {
            if (b.type === 'p') return (
              <Text key={i} style={[styles.bodyP, b.lead && styles.bodyPLead]}>
                {i === 0 ? <Text style={styles.dropcap}>{b.text.charAt(0)}</Text> : null}
                {i === 0 ? b.text.slice(1) : b.text}
              </Text>
            );
            if (b.type === 'h') return (
              <Text key={i} style={styles.bodyH}>{b.text}</Text>
            );
            if (b.type === 'quote') return (
              <View key={i} style={styles.blockquote}>
                <Text style={styles.blockquoteText}>{b.text}</Text>
                {b.who && <Text style={styles.blockquoteCite}>— {b.who}</Text>}
              </View>
            );
            return null;
          })}

          {/* Fallback for HTML content */}
          {!a.body?.length && a.content && (
            <Text style={styles.bodyP}>{a.content.replace(/<[^>]+>/g, '')}</Text>
          )}
        </View>

        {/* Related */}
        {related.length > 0 && (
          <View style={styles.related}>
            <View style={styles.relatedHeader}>
              <Text style={styles.relatedTitle}>Continúa <Text style={{ fontStyle: 'italic', color: colors.green }}>leyendo</Text></Text>
            </View>
            {related.map(s => (
              <TouchableOpacity
                key={s.id}
                style={styles.relatedItem}
                onPress={() => navigation.replace('Article', { slug: s.slug || s.id, post: s })}
                activeOpacity={0.8}
              >
                <View style={styles.relatedThumb}>
                  {s.imgUrl
                    ? <Image source={{ uri: s.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    : <CatImage slug={s.img || s.catSlug} style={StyleSheet.absoluteFill} />
                  }
                </View>
                <View style={styles.relatedText}>
                  <Text style={styles.relatedCat}>{s.cat}</Text>
                  <Text style={styles.relatedItemTitle} numberOfLines={2}>{s.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Sticky action bar */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity style={styles.shareBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21l1.6-4.7A8 8 0 1 1 8 19.4Z"/>
          </svg>
          <Text style={styles.shareBtnText}>Compartir por WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionIconBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>
          </svg>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.06)',
    zIndex: 30,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.greenVivid,
  },
  scroll: { flex: 1 },

  // Hero
  hero: {
    height: 440,
    backgroundColor: colors.ink,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  heroTopBar: {
    position: 'absolute',
    left: 16, right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 5,
  },
  circleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: 20,
  },
  heroChip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.greenVivid,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  heroChipText: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.ink,
  },
  heroTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 28,
    lineHeight: 32,
    color: 'white',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  heroDeck: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.88)',
  },

  // Author bar
  authorBar: {
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.greenVivid,
    alignItems: 'center', justifyContent: 'center',
  },
  authorAvatarText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 18,
    color: colors.ink,
    fontWeight: '500',
  },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 13, fontWeight: '500', color: colors.ink },
  authorMeta: { fontSize: 11, color: colors.inkFaint },
  followBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.green,
  },
  followBtnText: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.4,
    color: 'white',
  },

  // Key points
  keyPoints: {
    margin: 20,
    backgroundColor: colors.greenSoft,
    borderWidth: 1,
    borderColor: colors.greenLine,
    borderRadius: 14,
    padding: 16,
  },
  keyPointsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 10,
  },
  keyPointsStar: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
  },
  keyPointsStarText: { fontSize: 9, color: 'white' },
  keyPointsLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.green,
  },
  keyPointItem: {
    flexDirection: 'row', gap: 10,
    marginTop: 8,
  },
  keyPointNum: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.green,
  },
  keyPointText: {
    flex: 1, fontSize: 13, lineHeight: 20, color: colors.ink,
  },

  // Body
  body: { paddingHorizontal: 22, paddingVertical: 12 },
  bodyP: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 17,
    lineHeight: 26,
    color: colors.ink,
    marginBottom: 18,
  },
  bodyPLead: { fontSize: 18, fontWeight: '500' },
  dropcap: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 64,
    lineHeight: 50,
    color: colors.green,
  },
  bodyH: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24,
    lineHeight: 28,
    color: colors.ink,
    letterSpacing: -0.3,
    marginTop: 22,
    marginBottom: 12,
  },
  blockquote: {
    marginVertical: 26,
    marginHorizontal: -22,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.greenVivid,
    backgroundColor: colors.paper2,
  },
  blockquoteText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 22,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: 8,
  },
  blockquoteCite: {
    fontSize: 10, fontWeight: '600', letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.inkMuted,
  },

  // Related
  related: { paddingHorizontal: 20, marginTop: 24 },
  relatedHeader: {
    borderTopWidth: 2, borderTopColor: colors.ink,
    paddingTop: 12, marginBottom: 8,
  },
  relatedTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 24, color: colors.ink, letterSpacing: -0.3,
  },
  relatedItem: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  relatedThumb: {
    width: 100, height: 80, borderRadius: 8, overflow: 'hidden',
    backgroundColor: colors.paper2, position: 'relative',
  },
  relatedText: { flex: 1, gap: 4 },
  relatedCat: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.4,
    textTransform: 'uppercase', color: colors.green,
  },
  relatedItemTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 15, lineHeight: 20, color: colors.ink, letterSpacing: -0.2,
  },

  // Action bar
  actionBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 14,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(250,249,245,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  shareBtn: {
    flex: 1, height: 46, borderRadius: 999,
    backgroundColor: colors.green,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  shareBtnText: {
    fontSize: 14, fontWeight: '500', color: 'white',
  },
  actionIconBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
});
