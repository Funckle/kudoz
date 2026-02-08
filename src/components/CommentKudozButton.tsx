import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { giveCommentKudoz, removeCommentKudoz } from '../services/commentReactions';
import { checkRateLimit } from '../utils/rateLimit';

interface CommentKudozButtonProps {
  commentId: string;
  initialCount: number;
  initialActive: boolean;
}

export function CommentKudozButton({ commentId, initialCount, initialActive }: CommentKudozButtonProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);

  // Sync state when server data arrives after initial mount
  useEffect(() => {
    setActive(initialActive);
    setCount(initialCount);
  }, [initialActive, initialCount]);

  const handlePress = useCallback(async () => {
    if (!user) return;

    const rateCheck = checkRateLimit('kudoz');
    if (!rateCheck.allowed) return;

    // Optimistic update
    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));

    const result = wasActive
      ? await removeCommentKudoz(user.id, commentId)
      : await giveCommentKudoz(user.id, commentId);

    if (result.error) {
      // Revert
      setActive(wasActive);
      setCount((c) => (wasActive ? c + 1 : c - 1));
    }
  }, [user, active, commentId]);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.6}>
      <View style={[
        styles.icon,
        { borderColor: colors.border },
        active && { backgroundColor: colors.text, borderColor: colors.text },
      ]}>
        <Text style={[
          styles.iconText,
          { color: colors.textSecondary },
          active && { color: colors.background },
        ]}>K</Text>
      </View>
      {count > 0 && (
        <Text style={[
          styles.count,
          { color: colors.textSecondary },
          active && { color: colors.text },
        ]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 10,
    fontWeight: '700',
  },
  count: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: 4,
  },
});
