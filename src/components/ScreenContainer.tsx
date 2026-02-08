import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
  noTopInset?: boolean;
}

export function ScreenContainer({ children, style, noPadding, noTopInset }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: noTopInset ? 0 : insets.top },
        !noPadding && styles.padding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: spacing.md,
  },
});
