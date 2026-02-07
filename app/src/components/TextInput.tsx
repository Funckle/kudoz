import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, typography, spacing, borderRadius, borders } from '../utils/theme';
import { checkContent } from '../utils/moderation';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  maxLength?: number;
  error?: string;
  filterBadWords?: boolean;
  onBadWord?: (words: string[]) => void;
}

export function TextInput({
  label,
  maxLength,
  error,
  filterBadWords = false,
  onBadWord,
  onChangeText,
  value,
  ...rest
}: TextInputProps) {
  const [badWordWarning, setBadWordWarning] = useState('');

  const handleChangeText = (text: string) => {
    if (filterBadWords) {
      const result = checkContent(text);
      if (!result.clean) {
        setBadWordWarning('Please keep it friendly');
        onBadWord?.(result.flaggedWords);
      } else {
        setBadWordWarning('');
      }
    }
    onChangeText?.(text);
  };

  const displayError = error || badWordWarning;
  const charCount = value?.length ?? 0;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, rest.multiline && styles.multiline, displayError && styles.inputError]}
        value={value}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        placeholderTextColor={colors.gray}
        {...rest}
      />
      <View style={styles.footer}>
        {displayError ? (
          <Text style={styles.error}>{displayError}</Text>
        ) : (
          <View />
        )}
        {maxLength && (
          <Text style={[styles.counter, charCount >= maxLength && styles.counterLimit]}>
            {charCount}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.black,
  },
  input: {
    ...typography.body,
    borderWidth: borders.width,
    borderColor: borders.color,
    borderRadius,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    color: colors.black,
    backgroundColor: colors.white,
    minHeight: 44,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.red,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.red,
    flex: 1,
  },
  counter: {
    ...typography.caption,
    color: colors.gray,
  },
  counterLimit: {
    color: colors.red,
  },
});
