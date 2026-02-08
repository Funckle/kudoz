import React from 'react';
import { YStack, Text } from 'tamagui';
import { useRole } from '../hooks/useRole';

export function SuspensionBanner() {
  const { isSuspended, suspendedUntil, suspensionReason } = useRole();

  if (!isSuspended || !suspendedUntil) return null;

  const isBanned = new Date(suspendedUntil).getFullYear() >= 9999;
  const dateLabel = isBanned
    ? 'permanently'
    : `until ${new Date(suspendedUntil).toLocaleDateString()}`;

  return (
    <YStack backgroundColor="$error" paddingVertical="$sm" paddingHorizontal="$md">
      <Text fontSize="$2" fontWeight="600" color="white">
        Your account is suspended {dateLabel}
      </Text>
      {suspensionReason && (
        <Text fontSize="$1" color="white" opacity={0.9} marginTop={2}>
          Reason: {suspensionReason}
        </Text>
      )}
      <Text fontSize="$1" color="white" opacity={0.8} marginTop={2}>
        You can browse but cannot post, comment, or react.
      </Text>
    </YStack>
  );
}
