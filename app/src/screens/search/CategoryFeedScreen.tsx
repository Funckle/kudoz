import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { PostCard } from '../../components/PostCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { colors } from '../../utils/theme';
import { getPostsByCategory } from '../../services/search';
import type { PostWithAuthor } from '../../types/database';
import type { SearchScreenProps } from '../../types/navigation';

export function CategoryFeedScreen({ route, navigation }: SearchScreenProps<'CategoryFeed'>) {
  const { categoryId } = route.params;
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = useCallback(async (refresh = false) => {
    const { posts: p } = await getPostsByCategory(categoryId);
    setPosts(p);
    setLoading(false);
    setRefreshing(false);
  }, [categoryId]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPressAuthor={() => navigation.navigate('UserProfile', { userId: item.user_id })}
          onPressGoal={() => navigation.navigate('GoalDetail', { goalId: item.goal_id })}
          onPressPost={() => navigation.navigate('PostDetail', { postId: item.id })}
          onPressComments={() => navigation.navigate('PostDetail', { postId: item.id })}
        />
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPosts(true); }} />}
      ListEmptyComponent={<EmptyState title="No posts in this category yet" />}
      style={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.white },
});
