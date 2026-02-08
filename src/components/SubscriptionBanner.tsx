import React from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';

interface SubscriptionBannerProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function SubscriptionBanner({ onUpgrade, onDismiss }: SubscriptionBannerProps) {
  const theme = useTheme();

  return (
    <YStack
      padding="$md"
      borderBottomWidth={1}
      backgroundColor="$warning"
      borderBottomColor="$warningAccent"
    >
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontSize="$1" color="$warningText" flex={1} marginRight="$sm">
          Your subscription has expired. Upgrade to create new goals and comment.
        </Text>
        <XStack alignItems="center">
          <TouchableOpacity
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: theme.warningAccent.val,
              marginRight: 8,
            }}
            onPress={onUpgrade}
          >
            <Text fontSize="$1" fontWeight="600" color="#FFFFFF">Upgrade</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text fontSize={16} color="$warningText">✕</Text>
          </TouchableOpacity>
        </XStack>
      </XStack>
    </YStack>
  );
}
