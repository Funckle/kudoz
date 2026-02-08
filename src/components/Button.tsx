import React from 'react';
import { ActivityIndicator, ViewStyle } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const bg =
    variant === 'primary' ? theme.color.val :
    variant === 'destructive' ? theme.error.val :
    theme.background.val;

  const textColor =
    variant === 'secondary' ? theme.color.val : theme.background.val;

  return (
    <YStack
      paddingVertical="$smPlus"
      paddingHorizontal="$md"
      borderRadius="$md"
      alignItems="center"
      justifyContent="center"
      backgroundColor={bg}
      borderWidth={variant === 'secondary' ? 1 : 0}
      borderColor={variant === 'secondary' ? '$borderColor' : undefined}
      opacity={isDisabled ? 0.5 : 1}
      onPress={isDisabled ? undefined : onPress}
      pressStyle={{ opacity: 0.7 }}
      cursor={isDisabled ? 'default' : 'pointer'}
      {...(style ? { style } : {})}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text fontSize="$2" fontWeight="600" color={textColor}>
          {title}
        </Text>
      )}
    </YStack>
  );
}
