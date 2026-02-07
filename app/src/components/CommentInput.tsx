import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, borders } from '../utils/theme';
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
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>{disabledMessage || 'Comments unavailable'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {replyingTo && (
        <View style={styles.replyBar}>
          <Text style={styles.replyText}>Replying to @{replyingTo}</Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text style={styles.cancelReply}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      {warning ? <Text style={styles.warning}>{warning}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={text}
          onChangeText={(t) => { setText(t); setWarning(''); }}
          maxLength={LIMITS.COMMENT}
          multiline
          placeholderTextColor={colors.gray}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || sending}
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
        >
          <Text style={styles.sendText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: borders.width,
    borderTopColor: borders.color,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  disabledContainer: {
    borderTopWidth: borders.width,
    borderTopColor: borders.color,
    padding: spacing.md,
    backgroundColor: colors.grayLighter,
    alignItems: 'center',
  },
  disabledText: {
    ...typography.body,
    color: colors.gray,
  },
  replyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.xs,
  },
  replyText: {
    ...typography.caption,
    color: colors.gray,
  },
  cancelReply: {
    ...typography.caption,
    color: colors.red,
  },
  warning: {
    ...typography.caption,
    color: colors.red,
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    ...typography.body,
    borderWidth: borders.width,
    borderColor: borders.color,
    borderRadius,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    maxHeight: 80,
    color: colors.black,
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
    color: colors.black,
  },
});
