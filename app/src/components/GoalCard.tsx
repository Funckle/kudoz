import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { CategoryBadge } from './CategoryBadge';
import { colors, typography, spacing, borderRadius, borders } from '../utils/theme';
import type { GoalWithCategories } from '../types/database';

interface GoalCardProps {
  goal: GoalWithCategories;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const formatValue = (value: number) => {
    if (goal.goal_type === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const primaryColor = goal.categories?.[0]?.color ?? colors.black;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{goal.title}</Text>
        {goal.status === 'completed' && <Text style={styles.completed}>Completed</Text>}
      </View>
      <Text style={styles.type}>
        {goal.goal_type === 'currency' ? 'Savings' : goal.goal_type === 'count' ? 'Counter' : 'Milestone'}
      </Text>
      {goal.target_value && goal.goal_type !== 'milestone' ? (
        <View style={styles.progressSection}>
          <ProgressBar current={goal.current_value} target={goal.target_value} color={primaryColor} />
          <Text style={styles.progressText}>
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
    borderWidth: borders.width,
    borderColor: borders.color,
    borderRadius,
    marginBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.goalTitle,
    color: colors.black,
    flex: 1,
  },
  completed: {
    ...typography.caption,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
  type: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  progressSection: {
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.caption,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
