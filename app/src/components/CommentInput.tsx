import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { LIMITS } from '../utils/validation';
import { checkContent } from '../utils/moderation';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  replyingTo?: string;
  onCancelReply?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

export function CommentInput({ onSubmit, replyingTo, onCancelReply, disabled, disabledMessage }: CommentInputProps) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState('');

  const handleSubmit = async () => {
    if (!text.trim() || disabled) return;
    const check = checkContent(text);
    if (!check.clean) {
      setWarning('Please keep it friendly');
      return;
    }
    setSending(true);
    await onSubmit(text.trim());
    setText('');
    setWarning('');
    setSending(false);
  };

  if (disabled) {
    return (
      <View style={[styles.disabledContainer, { borderTopColor: colors.border, backgroundColor: colors.borderLight }]}>
        <Text style={[styles.disabledText, { color: colors.textSecondary }]}>{disabledMessage || 'Comments unavailable'}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
      {replyingTo && (
        <View style={styles.replyBar}>
          <Text style={[styles.replyText, { color: colors.textSecondary }]}>Replying to @{replyingTo}</Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text style={[styles.cancelReply, { color: colors.error }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {warning ? <Text style={[styles.warning, { color: colors.error }]}>{warning}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Add a comment..."
          value={text}
          onChangeText={(t) => { setText(t); setWarning(''); }}
          maxLength={LIMITS.COMMENT}
          multiline
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || sending}
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
        >
          <Text style={[styles.sendText, { color: colors.text }]}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    padding: spacing.sm,
  },
  disabledContainer: {
    borderTopWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  disabledText: {
    ...typography.body,
  },
  replyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  replyText: {
    ...typography.caption,
  },
  cancelReply: {
    ...typography.caption,
  },
  warning: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.body,
    borderWidth: 1,
    borderRadius,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    maxHeight: 80,
  },
  sendBtn: {
    marginLeft: spacing.sm,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendText: {
    ...typography.body,
    fontWeight: '600',
  },
});
