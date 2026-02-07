import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { FollowButton } from './FollowButton';
import { colors, typography, spacing, borders } from '../utils/theme';

interface UserSearchResultProps {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  onPress: () => void;
}

export function UserSearchResult({ id, name, username, avatarUrl, onPress }: UserSearchResultProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Avatar uri={avatarUrl} name={name} size={48} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        {username && <Text style={styles.username}>@{username}</Text>}
      </View>
      <FollowButton userId={id} compact />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: borders.width,
    borderBottomColor: borders.color,
  },
  info: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    ...typography.goalTitle,
    color: colors.black,
  },
  username: {
    ...typography.caption,
    color: colors.gray,
  },
});
