import React from 'react';
import { ActivityIndicator } from 'react-native';
import { YStack, useTheme } from 'tamagui';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
}

export function LoadingSpinner({ size = 'large' }: LoadingSpinnerProps) {
  const theme = useTheme();

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="$background">
      <ActivityIndicator size={size} color={theme.color.val} />
    </YStack>
  );
}
