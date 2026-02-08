import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'tamagui';
import { useAuth } from '../hooks/useAuth';
import { followUser, unfollowUser, checkFollowStatus } from '../services/follows';

interface FollowButtonProps {
  userId: string;
  compact?: boolean;
}

export function FollowButton({ userId, compact }: FollowButtonProps) {
  const theme = useTheme();
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
      style={{
        paddingHorizontal: compact ? 8 : 16,
        paddingVertical: compact ? 4 : 6,
        borderRadius: 8,
        backgroundColor: isFollowing ? theme.background.val : theme.color.val,
        borderWidth: isFollowing ? 1 : 0,
        borderColor: isFollowing ? theme.borderColor.val : undefined,
      }}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text
        fontSize="$1"
        fontWeight="600"
        color={isFollowing ? theme.color.val : theme.background.val}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
