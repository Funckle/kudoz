import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borders, borderRadius } from '../utils/theme';

interface GoalSearchResultProps {
  title: string;
  description: string | null;
  onPress: () => void;
}

export function GoalSearchResult({ title, description, onPress }: GoalSearchResultProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {description && <Text style={styles.description} numberOfLines={2}>{description}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderBottomWidth: borders.width,
    borderBottomColor: borders.color,
  },
  title: {
    ...typography.goalTitle,
    color: colors.black,
  },
  description: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
  },
});
