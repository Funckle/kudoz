import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { CategoryBadge } from './CategoryBadge';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import type { GoalWithCategories } from '../types/database';

interface GoalCardProps {
  goal: GoalWithCategories;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const { colors } = useTheme();

  const formatValue = (value: number) => {
    if (goal.goal_type === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const primaryColor = goal.categories?.[0]?.color ?? colors.text;

  return (
    <TouchableOpacity style={[styles.card, { borderColor: colors.border, backgroundColor: colors.background }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{goal.title}</Text>
        {goal.status === 'completed' && <Text style={[styles.completed, { color: colors.textSecondary }]}>Completed</Text>}
      </View>
      <Text style={[styles.type, { color: colors.textSecondary }]}>
        {goal.goal_type === 'currency' ? 'Savings' : goal.goal_type === 'count' ? 'Counter' : 'Milestone'}
      </Text>
      {goal.target_value && goal.goal_type !== 'milestone' ? (
        <View style={styles.progressSection}>
          <ProgressBar current={goal.current_value} target={goal.target_value} color={primaryColor} />
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {formatValue(goal.current_value)} / {formatValue(goal.target_value)}
          </Text>
        </View>
      ) : null}
      {goal.categories && goal.categories.length > 0 && (
        <View style={styles.categories}>
          {goal.categories.map((cat) => (
            <CategoryBadge key={cat.id} category={cat} />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderRadius,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.goalTitle,
    flex: 1,
  },
  completed: {
    ...typography.caption,
    marginLeft: spacing.sm,
  },
  type: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
