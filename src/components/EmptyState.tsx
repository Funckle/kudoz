import React from 'react';
import { YStack, Text } from 'tamagui';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionTitle, onAction }: EmptyStateProps) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$xl">
      <Text fontSize="$4" fontWeight="600" color="$color" textAlign="center" marginBottom="$sm">
        {title}
      </Text>
      {message && (
        <Text fontSize="$2" color="$colorSecondary" textAlign="center" marginBottom="$md">
          {message}
        </Text>
      )}
      {actionTitle && onAction && (
        <Button title={actionTitle} onPress={onAction} style={{ marginTop: 8, minWidth: 160 }} />
      )}
    </YStack>
  );
}
