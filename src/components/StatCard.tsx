import React from 'react';
import { YStack, Text } from 'tamagui';

interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <YStack
      flex={1}
      minWidth={70}
      padding="$sm"
      borderWidth={1}
      borderColor="$borderColor"
      borderRadius="$md"
      alignItems="center"
      marginRight="$xs"
      marginBottom="$xs"
    >
      <Text fontSize={20} fontWeight="700" color="$color">{value}</Text>
      <Text fontSize="$1" color="$colorSecondary" marginTop={2}>{label}</Text>
    </YStack>
  );
}
