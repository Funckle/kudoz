import React from 'react';
import { XStack, YStack, Text } from 'tamagui';
import { Category } from '../types/database';

interface CategoryBadgeProps {
  category: Category;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <XStack
      alignItems="center"
      paddingHorizontal="$sm"
      paddingVertical="$xs"
      borderRadius="$md"
      backgroundColor="$borderColorLight"
      marginRight="$xs"
      marginBottom="$xs"
    >
      <YStack
        width={8}
        height={8}
        borderRadius={4}
        backgroundColor={category.color}
        marginRight="$xs"
      />
      <Text fontSize="$1" color="$colorSecondary">{category.name}</Text>
    </XStack>
  );
}
