import React from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { Avatar } from './Avatar';
import { FollowButton } from './FollowButton';

interface UserSearchResultProps {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  onPress: () => void;
}

export function UserSearchResult({ id, name, username, avatarUrl, onPress }: UserSearchResultProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <XStack alignItems="center" padding="$md" borderBottomWidth={1} borderBottomColor="$borderColor">
        <Avatar uri={avatarUrl} name={name} size={48} />
        <YStack flex={1} marginLeft="$sm">
          <Text fontSize="$3" fontWeight="600" color="$color">{name}</Text>
          {username && <Text fontSize="$1" color="$colorSecondary">@{username}</Text>}
        </YStack>
        <FollowButton userId={id} compact />
      </XStack>
    </TouchableOpacity>
  );
}
