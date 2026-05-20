import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function BreakingBanner({ items = [], onPress }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const id = setInterval(() => setI(v => (v + 1) % items.length), 4500);
    return () => clearInterval(id);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.85}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>En vivo</Text>
      </View>
      <Text style={styles.text} numberOfLines={1}>
        {items[i]}
      </Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 18,
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.breaking,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexShrink: 0,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'white',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'white',
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  arrow: {
    fontSize: 16,
    color: colors.greenVivid,
    flexShrink: 0,
  },
});
