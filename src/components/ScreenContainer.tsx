import React from 'react';
import { ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  noTopInset?: boolean;
}

export function ScreenContainer({ children, style, noPadding, noTopInset }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={noTopInset ? 0 : insets.top}
      paddingHorizontal={noPadding ? 0 : '$md'}
      {...(style ? { style } : {})}
    >
      {children}
    </YStack>
  );
}
