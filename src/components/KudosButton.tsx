import React, { useState, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, useTheme } from 'tamagui';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import { giveKudos, removeKudos } from '../services/reactions';
import { checkRateLimit } from '../utils/rateLimit';

interface KudosButtonProps {
  postId: string;
  initialCount: number;
  initialActive: boolean;
}

export function KudosButton({ postId, initialCount, initialActive }: KudosButtonProps) {
  const { user } = useAuth();
  const { isSuspended } = useRole();
  const theme = useTheme();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);

  const handlePress = useCallback(async () => {
    if (!user || isSuspended) return;

    const rateCheck = checkRateLimit('kudos');
    if (!rateCheck.allowed) return;

    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));

    const result = wasActive
      ? await removeKudos(user.id, postId)
      : await giveKudos(user.id, postId);

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
