import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from './ProgressBar';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import type { GoalWithCategories } from '../types/database';

interface GoalProgressHeaderProps {
  goal: GoalWithCategories;
}

export function GoalProgressHeader({ goal }: GoalProgressHeaderProps) {
  const { colors } = useTheme();
  const primaryColor = goal.categories?.[0]?.color ?? colors.text;

  const formatValue = (value: number) => {
    if (goal.goal_type === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const progressPercent =
    goal.target_value && goal.target_value > 0
      ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
      : 0;

  return (
    <View style={styles.container}>
      {goal.goal_type === 'milestone' ? (
        <View style={styles.milestoneContainer}>
          <Text style={[styles.milestoneLabel, { color: colors.text }]}>
            {goal.status === 'completed' ? 'Achieved' : 'In Progress'}
          </Text>
          {goal.effort_label && goal.effort_target && (
            <View style={styles.effortSection}>
              <Text style={[styles.effortLabel, { color: colors.text }]}>{goal.effort_label}</Text>
              <ProgressBar current={goal.current_value} target={goal.effort_target} color={primaryColor} height={12} />
              <Text style={[styles.effortText, { color: colors.textSecondary }]}>
                {goal.current_value} / {goal.effort_target}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text style={[styles.bigNumber, { color: colors.text }]}>{formatValue(goal.current_value)}</Text>
          {goal.target_value && (
            <>
              <Text style={[styles.targetText, { color: colors.textSecondary }]}>of {formatValue(goal.target_value)}</Text>
              <ProgressBar current={goal.current_value} target={goal.target_value} color={primaryColor} height={12} />
              <Text style={[styles.percentText, { color: colors.textSecondary }]}>{progressPercent}%</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  bigNumber: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  targetText: {
    ...typography.body,
    marginBottom: spacing.sm,
  },
  percentText: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  milestoneContainer: {
    alignItems: 'center',
  },
  milestoneLabel: {
    ...typography.sectionHeader,
  },
  effortSection: {
    width: '100%',
    marginTop: spacing.md,
  },
  effortLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  effortText: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
