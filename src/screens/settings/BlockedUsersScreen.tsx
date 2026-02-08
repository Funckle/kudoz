import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, useTheme } from 'tamagui';
import { Avatar } from '../../components/Avatar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getBlockedUsers, unblockUser } from '../../services/social';

interface BlockedUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
}

export function BlockedUsersScreen() {
  const theme = useTheme();
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
          <XStack padding="$md" borderBottomWidth={1} borderBottomColor="$borderColor" alignItems="center">
            <Avatar uri={item.avatar_url} name={item.name} size={48} />
            <YStack flex={1} marginLeft="$sm">
              <Text fontSize="$2" fontWeight="600" color="$color">{item.name}</Text>
              <Text fontSize="$1" color="$colorSecondary">@{item.username}</Text>
            </YStack>
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: theme.borderColor.val,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
              onPress={() => handleUnblock(item.id)}
            >
              <Text fontSize="$1" fontWeight="600" color="$color">Unblock</Text>
            </TouchableOpacity>
          </XStack>
        )}
        ListEmptyComponent={<EmptyState title="No blocked users" />}
        style={{ flex: 1 }}
      />
    </ScreenContainer>
  );
}
