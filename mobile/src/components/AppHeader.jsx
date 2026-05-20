import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 9H3c0-1 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/>
  </svg>
);

export default function AppHeader({
  greeting = 'Buenos días',
  showSearch = true,
  showNotif = true,
  transparent = false,
  onSearchPress,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + 8 },
      transparent && styles.transparent,
    ]}>
      <View style={styles.row}>
        <View style={styles.titleBlock}>
          <Text style={styles.greeting}>{greeting} · jueves</Text>
          <Text style={styles.logo}>
            Tane <Text style={styles.logoGreen}>tanae</Text>
          </Text>
        </View>
        <View style={styles.actions}>
          {showSearch && (
            <TouchableOpacity style={styles.iconBtn} onPress={onSearchPress}>
              <SearchIcon />
            </TouchableOpacity>
          )}
          {showNotif && (
            <TouchableOpacity style={styles.iconBtn}>
              <BellIcon />
              <View style={styles.badge} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.paper,
    paddingHorizontal: 20,
    paddingBottom: 14,
    zIndex: 20,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
  },
  greeting: {
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
    fontWeight: '500',
  },
  logo: {
    fontSize: 26,
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.ink,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: -0.5,
  },
  logoGreen: {
    color: colors.green,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.greenVivid,
    borderWidth: 2,
    borderColor: colors.white,
  },
});
