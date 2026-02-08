import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
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
  const { colors } = useTheme();
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
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 13,
    fontWeight: '700',
  },
  count: {
    ...typography.caption,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});
