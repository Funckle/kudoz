import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ProgressBar } from './ProgressBar';
import { CategoryBadge } from './CategoryBadge';
import type { GoalWithCategories } from '../types/database';

interface GoalCardProps {
  goal: GoalWithCategories;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const theme = useTheme();

  const formatValue = (value: number) => {
    if (goal.goal_type === 'currency') return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  };

  const primaryColor = goal.categories?.[0]?.color ?? theme.color.val;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <YStack
        padding="$md"
        borderWidth={1}
        borderColor="$borderColor"
        backgroundColor="$background"
        borderRadius="$md"
        marginBottom="$sm"
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$xs">
          <Text fontSize="$3" fontWeight="600" color="$color" flex={1} numberOfLines={1}>
            {goal.title}
          </Text>
          {goal.status === 'completed' && (
            <Text fontSize="$1" color="$colorSecondary" marginLeft="$sm">Completed</Text>
          )}
        </XStack>
        <Text fontSize="$1" color="$colorSecondary" marginBottom="$sm">
          {goal.goal_type === 'currency' ? 'Savings' : goal.goal_type === 'count' ? 'Counter' : 'Milestone'}
        </Text>
        {goal.target_value && goal.goal_type !== 'milestone' ? (
          <YStack marginBottom="$sm">
            <ProgressBar current={goal.current_value} target={goal.target_value} color={primaryColor} />
            <Text fontSize="$1" color="$colorSecondary" marginTop="$xs">
              {formatValue(goal.current_value)} / {formatValue(goal.target_value)}
            </Text>
          </YStack>
        ) : null}
        {goal.categories && goal.categories.length > 0 && (
          <XStack flexWrap="wrap">
            {goal.categories.map((cat) => (
              <CategoryBadge key={cat.id} category={cat} />
            ))}
          </XStack>
        )}
      </YStack>
    </TouchableOpacity>
  );
}
