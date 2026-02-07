import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { UserSearchResult } from '../../components/UserSearchResult';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../utils/theme';
import { getFollowers, getFollowing } from '../../services/follows';
import type { User } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function FollowListScreen({ route, navigation }: HomeScreenProps<'FollowList'>) {
  const { userId, type } = route.params;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = type === 'followers' ? getFollowers : getFollowing;
    load(userId).then(({ users: u }) => {
      setUsers(u);
      setLoading(false);
    });
  }, [userId, type]);

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <UserSearchResult
          id={item.id}
          name={item.name}
          username={item.username}
          avatarUrl={item.avatar_url ?? null}
          onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
        />
      )}
      ListEmptyComponent={<EmptyState title={type === 'followers' ? 'No followers yet' : 'Not following anyone'} />}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.white },
});
