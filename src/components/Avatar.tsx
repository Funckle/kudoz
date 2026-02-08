import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { typography } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 32 | 48 | 80;
}

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const { colors } = useTheme();
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const fontSize = size === 80 ? 28 : size === 48 ? 18 : 12;

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border }]} />;
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border }]}>
      <Text style={[styles.initials, { fontSize, color: colors.textSecondary }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {},
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...typography.body,
    fontWeight: '600',
  },
});
