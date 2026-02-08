import React from 'react';
import { YStack, Text, useTheme } from 'tamagui';
import { ProgressBar } from './ProgressBar';
import type { GoalWithCategories } from '../types/database';

interface GoalProgressHeaderProps {
  goal: GoalWithCategories;
}

export function GoalProgressHeader({ goal }: GoalProgressHeaderProps) {
  const theme = useTheme();
  const primaryColor = goal.categories?.[0]?.color ?? theme.color.val;

  const formatValue = (value: number) => {
    if (goal.goal_type === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const progressPercent =
    goal.target_value && goal.target_value > 0
      ? Math.min(Math.round((goal.current_value / goal.target_value) * 100), 100)
      : 0;

  return (
    <YStack paddingVertical="$md">
      {goal.goal_type === 'milestone' ? (
        <YStack alignItems="center">
          <Text fontSize="$4" fontWeight="600" color="$color">
            {goal.status === 'completed' ? 'Achieved' : 'In Progress'}
          </Text>
          {goal.effort_label && goal.effort_target && (
            <YStack width="100%" marginTop="$md">
              <Text fontSize="$2" fontWeight="600" color="$color" marginBottom="$sm">
                {goal.effort_label}
              </Text>
              <ProgressBar current={goal.current_value} target={goal.effort_target} color={primaryColor} height={12} />
              <Text fontSize="$1" color="$colorSecondary" marginTop="$xs">
                {goal.current_value} / {goal.effort_target}
              </Text>
            </YStack>
          )}
        </YStack>
      ) : (
        <YStack>
          <Text fontSize="$6" fontWeight="700" color="$color" marginBottom="$xs">
            {formatValue(goal.current_value)}
          </Text>
          {goal.target_value && (
            <>
              <Text fontSize="$2" color="$colorSecondary" marginBottom="$sm">
                of {formatValue(goal.target_value)}
              </Text>
              <ProgressBar current={goal.current_value} target={goal.target_value} color={primaryColor} height={12} />
              <Text fontSize="$1" color="$colorSecondary" marginTop="$xs" textAlign="right">
                {progressPercent}%
              </Text>
            </>
          )}
        </YStack>
      )}
    </YStack>
  );
}
