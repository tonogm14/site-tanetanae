import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, getCatGradient } from '../constants/theme';

export default function CategoryCircle({ category, active = false, onPress }) {
  const gradient = getCatGradient(category.slug);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      {/* Gradient ring for active, plain line for inactive */}
      <View style={[styles.ring, active && styles.ringActive]}>
        <View style={[styles.inner, { backgroundColor: gradient[1] }]}>
          {/* Inner shine overlay */}
          <View style={StyleSheet.absoluteFill}>
            <View style={{ flex: 1, opacity: 0.25, backgroundColor: gradient[0] }} />
          </View>
        </View>
      </View>
      <Text style={styles.label} numberOfLines={1}>{category.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexShrink: 0,
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  ring: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    backgroundColor: colors.line,
  },
  ringActive: {
    backgroundColor: colors.green,
  },
  inner: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.paper,
    overflow: 'hidden',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.ink,
    textAlign: 'center',
  },
});
