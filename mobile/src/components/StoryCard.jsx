import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, getCatGradient, radius } from '../constants/theme';

// Gradient placeholder box (simulates tt-img--{slug} CSS)
export const CatImage = ({ slug, style }) => {
  const gradient = getCatGradient(slug);
  // LinearGradient would need expo-linear-gradient; use solid mid-color as fallback
  return (
    <View style={[{ backgroundColor: gradient[1], overflow: 'hidden' }, style]}>
      <View style={StyleSheet.absoluteFill}>
        <View style={{ flex: 1, opacity: 0.3, backgroundColor: gradient[0] }} />
      </View>
    </View>
  );
};

export default function StoryCard({ story, onPress, size = 'md' }) {
  const titleSize = size === 'lg' ? 22 : size === 'sm' ? 15 : 17;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      <View style={styles.imageWrap}>
        {story.imgUrl ? (
          <Image source={{ uri: story.imgUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <CatImage slug={story.img || story.catSlug} style={styles.image} />
        )}
      </View>
      <View style={styles.meta}>
        <Text style={styles.cat}>{story.cat || 'Recientes'}</Text>
        <View style={styles.dot} />
        <Text style={styles.date}>{story.date}</Text>
      </View>
      <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={3}>
        {story.title}
      </Text>
      {size !== 'sm' && story.author && (
        <Text style={styles.author}>Por {story.author}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  imageWrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cat: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.green,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
  },
  date: {
    fontSize: 12,
    color: colors.inkFaint,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 22,
    color: colors.ink,
    letterSpacing: -0.3,
  },
  author: {
    fontSize: 12,
    color: colors.inkFaint,
  },
});
