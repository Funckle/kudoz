import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';
import { PostCard } from '../../components/PostCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { colors } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { getFeedPosts } from '../../services/posts';
import type { PostWithAuthor } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function FeedScreen({ navigation }: HomeScreenProps<'Feed'>) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = useCallback(async (offset = 0, refresh = false) => {
    if (!user) return;
    const { posts: newPosts, error: err } = await getFeedPosts(user.id, 20, offset);
    if (err) {
      setError(err);
    } else {
      setPosts((prev) => (refresh ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === 20);
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    loadPosts(0, true);
  }, [loadPosts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage * 20);
  }, [hasMore, loading, page, loadPosts]);

  if (loading && posts.length === 0) return <LoadingSpinner />;
  if (error && posts.length === 0) return <ErrorState message={error} onRetry={() => loadPosts(0, true)} />;

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
          onDeleted={handleRefresh}
        />
      )}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <EmptyState
          title="Your feed is empty"
          message="Follow others or create your first goal to get started."
        />
      }
      style={styles.list}
      removeClippedSubviews
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
