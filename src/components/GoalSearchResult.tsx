import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, Text } from 'tamagui';

interface GoalSearchResultProps {
  title: string;
  description: string | null;
  onPress: () => void;
}

export function GoalSearchResult({ title, description, onPress }: GoalSearchResultProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <YStack padding="$md" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Text fontSize="$3" fontWeight="600" color="$color" numberOfLines={1}>{title}</Text>
        {description && (
          <Text fontSize="$1" color="$colorSecondary" marginTop="$xs" numberOfLines={2}>
            {description}
          </Text>
        )}
      </YStack>
    </TouchableOpacity>
  );
}
