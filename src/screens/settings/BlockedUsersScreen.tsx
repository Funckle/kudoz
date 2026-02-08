import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { typography, spacing, borderRadius } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getBlockedUsers, unblockUser } from '../../services/social';

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
}

export function BlockedUsersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    const result = await getBlockedUsers(user.id);
    setBlockedUsers(result.users || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUnblock = async (blockedId: string) => {
    if (!user) return;
    await unblockUser(user.id, blockedId);
    setBlockedUsers((prev) => prev.filter((u) => u.id !== blockedId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <Avatar uri={item.avatar_url} name={item.name} size={40} />
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.username, { color: colors.textSecondary }]}>@{item.username}</Text>
            </View>
            <TouchableOpacity style={[styles.unblockBtn, { borderColor: colors.border }]} onPress={() => handleUnblock(item.id)}>
              <Text style={[styles.unblockText, { color: colors.text }]}>Unblock</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No blocked users" />}
        style={styles.list}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  info: { flex: 1, marginLeft: spacing.sm },
  name: { ...typography.body, fontWeight: '600' },
  username: { ...typography.caption },
  unblockBtn: {
    borderWidth: 1,
    borderRadius,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
  },
  unblockText: { ...typography.caption, fontWeight: '600' },
});
