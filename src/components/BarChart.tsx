import React from 'react';
import { YStack, XStack, Text, useTheme } from 'tamagui';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <YStack paddingVertical="$sm">
      <XStack height={height} alignItems="flex-end" justifyContent="space-around">
        {data.map((item, index) => (
          <YStack key={index} alignItems="center" flex={1}>
            <YStack
              width={24}
              borderRadius="$xs"
              minHeight={2}
              height={(item.value / maxValue) * height}
              backgroundColor={item.color || theme.color.val}
            />
            <Text fontSize="$1" color="$colorSecondary" marginTop="$xs">{item.label}</Text>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}
