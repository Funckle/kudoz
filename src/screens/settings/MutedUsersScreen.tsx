import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, useTheme } from 'tamagui';
import { Avatar } from '../../components/Avatar';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getMutedUsers, unmuteUser } from '../../services/social';

interface MutedUser {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
}

export function MutedUsersScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    const result = await getMutedUsers(user.id);
    setMutedUsers(result.users || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleUnmute = async (mutedId: string) => {
    if (!user) return;
    await unmuteUser(user.id, mutedId);
    setMutedUsers((prev) => prev.filter((u) => u.id !== mutedId));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <FlatList
        data={mutedUsers}
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
              onPress={() => handleUnmute(item.id)}
            >
              <Text fontSize="$1" fontWeight="600" color="$color">Unmute</Text>
            </TouchableOpacity>
          </XStack>
        )}
        ListEmptyComponent={<EmptyState title="No muted users" />}
        style={{ flex: 1 }}
      />
    </ScreenContainer>
  );
}
