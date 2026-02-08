import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  maxLength?: number;
  error?: string;
}

export function TextInput({
  label,
  maxLength,
  error,
  onChangeText,
  value,
  ...rest
}: TextInputProps) {
  const theme = useTheme();

  const displayError = error;
  const charCount = value?.length ?? 0;

  return (
    <YStack marginBottom="$md">
      {label && (
        <Text fontSize="$2" fontWeight="600" color="$color" marginBottom="$xs">
          {label}
        </Text>
      )}
      <RNTextInput
        style={[
          {
            fontSize: 14,
            fontWeight: '400' as const,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            minHeight: 44,
            borderColor: displayError ? theme.error.val : theme.borderColor.val,
            color: theme.color.val,
            backgroundColor: theme.background.val,
          },
          rest.multiline && { minHeight: 88, textAlignVertical: 'top' as const },
        ]}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        placeholderTextColor={theme.colorSecondary.val}
        {...rest}
      />
      <XStack justifyContent="space-between" marginTop="$xs">
        {displayError ? (
          <Text fontSize="$1" color="$error" flex={1}>{displayError}</Text>
        ) : (
          <YStack />
        )}
        {maxLength ? (
          <Text
            fontSize="$1"
            color={charCount >= maxLength ? '$error' : '$colorSecondary'}
          >
            {charCount}/{maxLength}
          </Text>
        ) : null}
      </XStack>
    </YStack>
  );
}
