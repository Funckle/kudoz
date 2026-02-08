import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
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
  const { colors } = useTheme();
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
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <RNTextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }, rest.multiline && styles.multiline, displayError && { borderColor: colors.error }]}
        value={value}
        onChangeText={handleChangeText}
        maxLength={maxLength}
        placeholderTextColor={colors.textSecondary}
        {...rest}
      />
      <View style={styles.footer}>
        {displayError ? (
          <Text style={[styles.error, { color: colors.error }]}>{displayError}</Text>
        ) : (
          <View />
        )}
        {maxLength && (
          <Text style={[styles.counter, { color: colors.textSecondary }, charCount >= maxLength && { color: colors.error }]}>
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
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderRadius,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.sm + 2,
    minHeight: 44,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    flex: 1,
  },
  counter: {
    ...typography.caption,
  },
});
