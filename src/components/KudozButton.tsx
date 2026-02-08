import React, { useState, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, useTheme } from 'tamagui';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { giveKudoz, removeKudoz } from '../services/reactions';
import { checkRateLimit } from '../utils/rateLimit';

interface KudozButtonProps {
  postId: string;
  initialCount: number;
  initialActive: boolean;
}

export function KudozButton({ postId, initialCount, initialActive }: KudozButtonProps) {
  const { user } = useAuth();
  const { isSuspended } = useRole();
  const theme = useTheme();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);

  const handlePress = useCallback(async () => {
    if (!user || isSuspended) return;

    const rateCheck = checkRateLimit('kudoz');
    if (!rateCheck.allowed) return;

    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));

    const result = wasActive
      ? await removeKudoz(user.id, postId)
      : await giveKudoz(user.id, postId);

    if (result.error) {
      setActive(wasActive);
      setCount((c) => (wasActive ? c + 1 : c - 1));
    }
  }, [user, isSuspended, active, postId]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.6} style={{ opacity: isSuspended ? 0.5 : 1 }}>
      <XStack alignItems="center">
        <YStack
          width={28}
          height={28}
          borderRadius={14}
          borderWidth={1.5}
          alignItems="center"
          justifyContent="center"
          borderColor={active ? theme.color.val : theme.borderColor.val}
          backgroundColor={active ? theme.color.val : 'transparent'}
        >
          <Text
            fontSize={13}
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
            marginLeft="$xs"
            color={active ? '$color' : '$colorSecondary'}
          >
            {count}
          </Text>
        )}
      </XStack>
    </TouchableOpacity>
  );
}
