import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../constants/theme';

const TABS = [
  { id: 'home',    label: 'Inicio',    icon: 'home' },
  { id: 'explore', label: 'Explorar',  icon: 'grid' },
  { id: 'saved',   label: 'Guardados', icon: 'bookmark' },
  { id: 'me',      label: 'Perfil',    icon: 'user' },
];

const TabIcon = ({ name, color, size = 22 }) => {
  const stroke = color;
  const p = { width: size, height: size, fill: 'none', stroke, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

  if (name === 'home')     return <svg {...p} viewBox="0 0 24 24"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>;
  if (name === 'grid')     return <svg {...p} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
  if (name === 'bookmark') return <svg {...p} viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4z"/></svg>;
  if (name === 'user')     return <svg {...p} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4-6 8-6s6.5 2 8 6"/></svg>;
  return null;
};

export default function AppTabBar({ active = 'home', onPress }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.row}>
          {TABS.map(t => {
            const isActive = active === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => onPress?.(t.id)}
                style={styles.tab}
              >
                <TabIcon name={t.icon} color={isActive ? colors.green : colors.inkMuted} size={22} />
                <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
                {isActive && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 14,
    background: 'linear-gradient(180deg, transparent 0%, rgba(250,249,245,0.95) 30%)',
  },
  pill: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(14,17,22,0.06)',
    shadowColor: '#0E1116',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.inkMuted,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.green,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.green,
    marginTop: 1,
  },
});
