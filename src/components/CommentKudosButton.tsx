import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, useTheme } from 'tamagui';
import { useAuth } from '../hooks/useAuth';
import { giveCommentKudos, removeCommentKudos } from '../services/commentReactions';
import { checkRateLimit } from '../utils/rateLimit';

interface CommentKudosButtonProps {
  commentId: string;
  initialCount: number;
  initialActive: boolean;
}

export function CommentKudosButton({ commentId, initialCount, initialActive }: CommentKudosButtonProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setActive(initialActive);
    setCount(initialCount);
  }, [initialActive, initialCount]);

  const handlePress = useCallback(async () => {
    if (!user) return;

    const rateCheck = checkRateLimit('kudos');
    if (!rateCheck.allowed) return;

    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));

    const result = wasActive
      ? await removeCommentKudos(user.id, commentId)
      : await giveCommentKudos(user.id, commentId);

    if (result.error) {
      setActive(wasActive);
      setCount((c) => (wasActive ? c + 1 : c - 1));
    }
  }, [user, active, commentId]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.6}>
      <XStack alignItems="center" marginRight="$md">
        <YStack
          width={20}
          height={20}
          borderRadius={10}
          borderWidth={1.5}
          alignItems="center"
          justifyContent="center"
          borderColor={active ? theme.color.val : theme.borderColor.val}
          backgroundColor={active ? theme.color.val : 'transparent'}
        >
          <Text
            fontSize={10}
            fontWeight="700"
            color={active ? theme.background.val : theme.colorSecondary.val}
          >
            K
          </Text>
        </YStack>
        {count > 0 && (
          <Text
            fontSize="$1"
            fontWeight="600"
            marginLeft={4}
            color={active ? '$color' : '$colorSecondary'}
          >
            {count}
          </Text>
        )}
      </XStack>
    </TouchableOpacity>
  );
}
