import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { useAuth } from '../hooks/useAuth';
import { giveKudoz, removeKudoz } from '../services/reactions';
import { checkRateLimit } from '../utils/rateLimit';

interface KudozButtonProps {
  postId: string;
  initialCount: number;
  initialActive: boolean;
}

export function KudozButton({ postId, initialCount, initialActive }: KudozButtonProps) {
  const { user } = useAuth();
  const [active, setActive] = useState(initialActive);
  const [count, setCount] = useState(initialCount);

  const handlePress = useCallback(async () => {
    if (!user) return;

    const rateCheck = checkRateLimit('kudoz');
    if (!rateCheck.allowed) return;

    // Optimistic update
    const wasActive = active;
    setActive(!wasActive);
    setCount((c) => (wasActive ? c - 1 : c + 1));

    const result = wasActive
      ? await removeKudoz(user.id, postId)
      : await giveKudoz(user.id, postId);

    if (result.error) {
      // Revert
      setActive(wasActive);
      setCount((c) => (wasActive ? c + 1 : c - 1));
    }
  }, [user, active, postId]);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={0.6}>
      <View style={[styles.icon, active && styles.iconActive]}>
        <Text style={[styles.iconText, active && styles.iconTextActive]}>K</Text>
      </View>
      {count > 0 && (
        <Text style={[styles.count, active && styles.countActive]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconActive: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  iconText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray,
  },
  iconTextActive: {
    color: colors.white,
  },
  count: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray,
    marginLeft: spacing.xs,
  },
  countActive: {
    color: colors.black,
  },
});
