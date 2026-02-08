import React from 'react';
import { YStack, Text } from 'tamagui';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$xl">
      <Text fontSize="$2" color="$colorSecondary" textAlign="center" marginBottom="$md">
        {message}
      </Text>
      {onRetry && <Button title="Try again" onPress={onRetry} variant="secondary" />}
    </YStack>
  );
}
