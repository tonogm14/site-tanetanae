import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors, getCatGradient, radius } from '../constants/theme';

const CatImage = ({ slug, style }) => {
  const gradient = getCatGradient(slug);
  return (
    <View style={[{ backgroundColor: gradient[1], overflow: 'hidden' }, style]} />
  );
};

export default function StoryRow({ story, index, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.container}>
      {index !== undefined ? (
        <Text style={styles.index}>{index}</Text>
      ) : (
        <View style={styles.thumb}>
          {story.imgUrl
            ? <Image source={{ uri: story.imgUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            : <CatImage slug={story.img || story.catSlug} style={StyleSheet.absoluteFill} />
          }
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.cat}>{story.cat}</Text>
        <Text style={styles.title} numberOfLines={2}>{story.title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    alignItems: 'flex-start',
  },
  index: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontStyle: 'italic',
    fontSize: 28,
    color: colors.green,
    lineHeight: 28,
    width: 28,
    textAlign: 'right',
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  cat: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.green,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 15,
    lineHeight: 20,
    color: colors.ink,
    letterSpacing: -0.2,
  },
});
