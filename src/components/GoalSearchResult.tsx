import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface GoalSearchResultProps {
  title: string;
  description: string | null;
  onPress: () => void;
}

export function GoalSearchResult({ title, description, onPress }: GoalSearchResultProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      {description && <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{description}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    ...typography.goalTitle,
  },
  description: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
