import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { followUser, unfollowUser, checkFollowStatus } from '../services/follows';

interface FollowButtonProps {
  userId: string;
  compact?: boolean;
}

export function FollowButton({ userId, compact }: FollowButtonProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkFollowStatus(user.id, userId).then(({ isFollowing: f, isMutual: m }) => {
        setIsFollowing(f);
        setIsMutual(m);
        setLoading(false);
      });
    }
  }, [user, userId]);

  const handlePress = useCallback(async () => {
    if (!user) return;
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);

    const result = wasFollowing
      ? await unfollowUser(user.id, userId)
      : await followUser(user.id, userId);

    if (result.error) {
      setIsFollowing(wasFollowing);
    } else if (!wasFollowing) {
      // Re-check mutual status
      const status = await checkFollowStatus(user.id, userId);
      setIsMutual(status.isMutual);
    } else {
      setIsMutual(false);
    }
  }, [user, userId, isFollowing]);

  if (!user || user.id === userId) return null;
  if (loading) return null;

  const label = isMutual ? 'Mutual' : isFollowing ? 'Following' : 'Follow';

  return (
    <TouchableOpacity
      style={[styles.button, isFollowing ? styles.following : styles.notFollowing, compact && styles.compact]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isFollowing ? styles.followingText : styles.notFollowingText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius,
  },
  compact: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  notFollowing: {
    backgroundColor: colors.black,
  },
  following: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
  notFollowingText: {
    color: colors.white,
  },
  followingText: {
    color: colors.black,
  },
});
