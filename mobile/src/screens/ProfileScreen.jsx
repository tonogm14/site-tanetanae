import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, getCatGradient, radius } from '../constants/theme';
import { fetchMostRead, MOCK } from '../api/wordpress';

const CatImage = ({ slug, style }) => {
  const g = getCatGradient(slug);
  return <View style={[{ backgroundColor: g[1] }, style]} />;
};

const SETTINGS = [
  { i: '🔔', t: 'Notificaciones', s: 'Última hora, secciones favoritas', v: 'On' },
  { i: '💬', t: 'WhatsApp diario', s: 'Resumen 7:00 AM', v: 'On' },
  { i: '🌙', t: 'Modo oscuro', s: 'Automático según el sistema', v: 'Auto' },
  { i: '📲', t: 'Mis temas', s: 'Tucupita, Deportes, Cultura', v: 'Editar' },
  { i: '📡', t: 'Modo offline', s: 'Descarga el delta sin internet', v: '—' },
];

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(MOCK.mostRead);

  useEffect(() => {
    fetchMostRead().then(r => setSaved(r));
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: 110, paddingTop: insets.top + 16 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.titleArea}>
        <Text style={styles.pageTitle}>
          Mi <Text style={{ fontStyle: 'italic', color: colors.green }}>delta</Text>
        </Text>
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        {/* Background decoration */}
        <View style={styles.userCardBg} />
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>M</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>María Rodríguez</Text>
          <Text style={styles.userEmail}>maria@deltacorreo.com · Tucupita</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { v: '42', l: 'Guardadas' },
          { v: '12', l: 'Categorías' },
          { v: '3', l: 'Autores ★' },
        ].map(s => (
          <View key={s.l} style={styles.statBox}>
            <Text style={styles.statValue}>{s.v}</Text>
            <Text style={styles.statLabel}>{s.l}</Text>
          </View>
        ))}
      </View>

      {/* Saved articles */}
      <View style={styles.section}>
        <View style={styles.savedHeader}>
          <Text style={styles.savedTitle}>
            Guardadas para <Text style={{ fontStyle: 'italic', color: colors.green }}>después</Text>
          </Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        {saved.slice(0, 3).map(s => (
          <View key={s.id} style={styles.savedItem}>
            <View style={styles.savedThumb}>
              {s.imgUrl
                ? <Image source={{ uri: s.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                : <CatImage slug={s.img || s.catSlug} style={StyleSheet.absoluteFill} />
              }
            </View>
            <View style={styles.savedText}>
              <Text style={styles.savedCat}>{s.cat}</Text>
              <Text style={styles.savedItemTitle} numberOfLines={2}>{s.title}</Text>
            </View>
            <TouchableOpacity style={styles.savedBookmark}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={colors.green} stroke={colors.green} strokeWidth="1.6" strokeLinejoin="round">
                <path d="M6 4h12v17l-6-4-6 4z"/>
              </svg>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.settingsTitle}>Preferencias</Text>
        <View style={styles.settingsList}>
          {SETTINGS.map((r, i, arr) => (
            <View
              key={r.t}
              style={[styles.settingItem, i < arr.length - 1 && styles.settingBorder]}
            >
              <Text style={styles.settingIcon}>{r.i}</Text>
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>{r.t}</Text>
                <Text style={styles.settingDesc}>{r.s}</Text>
              </View>
              <Text style={styles.settingValue}>{r.v} ›</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  titleArea: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 32,
    lineHeight: 32,
    letterSpacing: -0.8,
    color: colors.ink,
  },

  // User card
  userCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    backgroundColor: colors.ink,
    borderRadius: 18,
    padding: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    position: 'relative',
  },
  userCardBg: {
    position: 'absolute',
    right: -40, top: -40,
    width: 140, height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(37,194,107,0.18)',
  },
  userAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.greenVivid,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  userAvatarText: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 26,
    color: colors.ink,
    fontWeight: '500',
  },
  userInfo: { flex: 1, zIndex: 1 },
  userName: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    lineHeight: 24,
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },

  // Stats
  statsRow: {
    paddingHorizontal: 20,
    marginBottom: 18,
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 26,
    color: colors.ink,
    lineHeight: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.inkMuted,
  },

  // Saved
  section: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  savedTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 12,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  savedItem: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    alignItems: 'center',
  },
  savedThumb: {
    width: 70, height: 70, borderRadius: 10,
    overflow: 'hidden', position: 'relative',
    backgroundColor: colors.paper2,
  },
  savedText: { flex: 1, gap: 4 },
  savedCat: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.2,
    textTransform: 'uppercase', color: colors.green,
  },
  savedItemTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 15, lineHeight: 20, color: colors.ink, letterSpacing: -0.2,
  },
  savedBookmark: { color: colors.green },

  // Settings
  settingsTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  settingsList: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    overflow: 'hidden',
  },
  settingItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  settingIcon: { fontSize: 18 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 14, color: colors.ink, fontWeight: '500' },
  settingDesc: { fontSize: 11, color: colors.inkFaint },
  settingValue: { fontSize: 12, color: colors.green, fontWeight: '500' },
});
