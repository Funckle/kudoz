import React from 'react';
import { Image } from 'react-native';
import { YStack, Text } from 'tamagui';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 32 | 48 | 80;
}

export function Avatar({ uri, name, size = 48 }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const fontSize = size === 80 ? 28 : size === 48 ? 18 : 12;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#E5E5E5' }}
      />
    );
  }

  return (
    <YStack
      width={size}
      height={size}
      borderRadius={size / 2}
      backgroundColor="$borderColor"
      alignItems="center"
      justifyContent="center"
    >
      <Text fontSize={fontSize} fontWeight="600" color="$colorSecondary">
        {initials}
      </Text>
    </YStack>
  );
}
