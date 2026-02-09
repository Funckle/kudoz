import React, { useState, useCallback, useRef } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, useTheme } from 'tamagui';
import { PostCard } from '../../components/PostCard';
import { InlineComments } from '../../components/InlineComments';
import { ReportModal } from '../../components/ReportModal';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { getFeedPosts } from '../../services/posts';
import type { PostWithAuthor, ContentType } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function FeedScreen({ navigation }: HomeScreenProps<'Feed'>) {
  const { user } = useAuth();
  const { isLapsed, canComment } = useSubscription();
  const theme = useTheme();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [reportTarget, setReportTarget] = useState<{ visible: boolean; contentType: ContentType; contentId: string }>({ visible: false, contentType: 'post', contentId: '' });
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

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

  useFocusEffect(useCallback(() => {
    loadPosts(0, true);
  }, [loadPosts]));

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setExpandedPostId(null);
    loadPosts(0, true);
  }, [loadPosts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage * 20);
  }, [hasMore, loading, page, loadPosts]);

  const handlePressComments = useCallback((postId: string) => {
    setExpandedPostId((prev) => prev === postId ? null : postId);
  }, []);

  const handleCommentCountChange = useCallback((postId: string, delta: number) => {
    setPosts((prev) => prev.map((p) =>
      p.id === postId ? { ...p, comment_count: Math.max(0, p.comment_count + delta) } : p
    ));
  }, []);

  if (loading && posts.length === 0) return <LoadingSpinner />;
  if (error && posts.length === 0) return <ErrorState message={error} onRetry={() => loadPosts(0, true)} />;

  return (
    <YStack flex={1}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        automaticallyAdjustKeyboardInsets
        ListHeaderComponent={
          isLapsed && !bannerDismissed ? (
            <SubscriptionBanner
              onUpgrade={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'Subscription' })}
              onDismiss={() => setBannerDismissed(true)}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <YStack>
            <PostCard
              post={item}
              isExpanded={expandedPostId === item.id}
              onPressAuthor={() => navigation.navigate('UserProfile', { userId: item.user_id })}
              onPressGoal={() => navigation.navigate('GoalDetail', { goalId: item.goal_id })}
              onPressPost={() => navigation.navigate('PostDetail', { postId: item.id })}
              onPressComments={() => handlePressComments(item.id)}
              onEdit={() => navigation.getParent()?.navigate('CreateModal', { screen: 'EditPost', params: { postId: item.id } })}
              onReport={() => setReportTarget({ visible: true, contentType: 'post', contentId: item.id })}
              onDeleted={handleRefresh}
            />
            {expandedPostId === item.id && (
              <InlineComments
                postId={item.id}
                userId={user!.id}
                canComment={canComment}
                onCommentCountChange={(delta) => handleCommentCountChange(item.id, delta)}
                onReport={(commentId) => setReportTarget({ visible: true, contentType: 'comment', contentId: commentId })}
              />
            )}
          </YStack>
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
        style={{ flex: 1, backgroundColor: theme.background.val }}
        removeClippedSubviews
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={7}
      />
      <ReportModal
        visible={reportTarget.visible}
        contentType={reportTarget.contentType}
        contentId={reportTarget.contentId}
        onClose={() => setReportTarget({ visible: false, contentType: 'post', contentId: '' })}
      />
    </YStack>
  );
}
