import React from 'react';
import { YStack } from 'tamagui';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ current, target, color, height = 8 }: ProgressBarProps) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;

  return (
    <YStack
      height={height}
      borderRadius={height / 2}
      backgroundColor="$borderColor"
      overflow="hidden"
    >
      <YStack
        position="absolute"
        left={0}
        top={0}
        height={height}
        borderRadius={height / 2}
        backgroundColor={color ?? '$color'}
        width={`${progress * 100}%` as any}
      />
    </YStack>
  );
}
