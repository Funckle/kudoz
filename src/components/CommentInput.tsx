import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { LIMITS } from '../utils/validation';
import { useRole } from '../hooks/useRole';

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  replyingTo?: string;
  onCancelReply?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
  noBorder?: boolean;
}

export interface CommentInputHandle {
  focus: () => void;
}

export const CommentInput = forwardRef<CommentInputHandle, CommentInputProps>(function CommentInput(
  { onSubmit, replyingTo, onCancelReply, disabled, disabledMessage, noBorder },
  ref,
) {
  const theme = useTheme();
  const { isSuspended } = useRole();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleSubmit = async () => {
    if (!text.trim() || disabled || isSuspended) return;
    setSending(true);
    await onSubmit(text.trim());
    setText('');
    setSending(false);
  };

  if (isSuspended) {
    return (
      <YStack
        borderTopWidth={noBorder ? 0 : 1}
        borderTopColor="$borderColor"
        backgroundColor="$borderColorLight"
        padding="$md"
        alignItems="center"
      >
        <Text fontSize="$2" color="$colorSecondary">Commenting is disabled during suspension</Text>
      </YStack>
    );
  }

  if (disabled) {
    return (
      <YStack
        borderTopWidth={noBorder ? 0 : 1}
        borderTopColor="$borderColor"
        backgroundColor="$borderColorLight"
        padding="$md"
        alignItems="center"
      >
        <Text fontSize="$2" color="$colorSecondary">{disabledMessage || 'Comments unavailable'}</Text>
      </YStack>
    );
  }

  return (
    <YStack
      borderTopWidth={noBorder ? 0 : 1}
      borderTopColor="$borderColor"
      backgroundColor="$surface"
      padding="$sm"
    >
      {replyingTo && (
        <XStack justifyContent="space-between" paddingBottom="$xs">
          <Text fontSize="$1" color="$colorSecondary">Replying to @{replyingTo}</Text>
          <TouchableOpacity onPress={onCancelReply}>
            <Text fontSize="$1" color="$error">Cancel</Text>
          </TouchableOpacity>
        </XStack>
      )}
      <XStack alignItems="flex-end">
        <TextInput
          ref={inputRef}
          style={{
            flex: 1,
            fontSize: 14,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 6,
            maxHeight: 80,
            borderColor: theme.borderColor.val,
            color: theme.color.val,
          }}
          placeholder="Add a comment..."
          value={text}
          onChangeText={setText}
          maxLength={LIMITS.COMMENT}
          placeholderTextColor={theme.colorSecondary.val}
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!text.trim() || sending}
          style={{
            marginLeft: 8,
            paddingVertical: 6,
            paddingHorizontal: 8,
            opacity: (!text.trim() || sending) ? 0.4 : 1,
          }}
        >
          <Text fontSize="$2" fontWeight="600" color="$color">Post</Text>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );
});
