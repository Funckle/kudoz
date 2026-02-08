import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { FollowButton } from './FollowButton';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface UserSearchResultProps {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  onPress: () => void;
}

export function UserSearchResult({ id, name, username, avatarUrl, onPress }: UserSearchResultProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity style={[styles.container, { borderBottomColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <Avatar uri={avatarUrl} name={name} size={48} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        {username && <Text style={[styles.username, { color: colors.textSecondary }]}>@{username}</Text>}
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
    borderBottomWidth: 1,
  },
  info: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  name: {
    ...typography.goalTitle,
  },
  username: {
    ...typography.caption,
  },
});
