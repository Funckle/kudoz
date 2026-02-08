import React, { useState, useCallback, useRef } from 'react';
import { FlatList, RefreshControl, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { PostCard } from '../../components/PostCard';
import { CommentItem } from '../../components/CommentItem';
import { CommentInput, CommentInputHandle } from '../../components/CommentInput';
import { ReportModal } from '../../components/ReportModal';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { getFeedPosts } from '../../services/posts';
import { getCommentsForPost, createComment, updateComment } from '../../services/comments';
import type { PostWithAuthor, CommentWithAuthor, ContentType } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

const COMMENTS_PAGE_SIZE = 10;

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

  // Inline comments state
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [editingComment, setEditingComment] = useState<CommentWithAuthor | null>(null);
  const [editText, setEditText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const commentInputRef = useRef<CommentInputHandle>(null);



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
    setComments([]);
    setReplyTo(null);
    setEditingComment(null);
    loadPosts(0, true);
  }, [loadPosts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadPosts(nextPage * 20);
  }, [hasMore, loading, page, loadPosts]);

  const loadComments = useCallback(async (postId: string) => {
    setCommentsLoading(true);
    const result = await getCommentsForPost(postId);
    setComments(result.comments);
    setCommentsLoading(false);
  }, []);

  const handlePressComments = useCallback((postId: string) => {
    if (expandedPostId === postId) {
      // Collapse
      setExpandedPostId(null);
      setComments([]);
      setReplyTo(null);
      setEditingComment(null);
      setEditText('');
    } else {
      // Expand new post
      setExpandedPostId(postId);
      setVisibleCount(COMMENTS_PAGE_SIZE);
      setReplyTo(null);
      setEditingComment(null);
      setEditText('');
      loadComments(postId);
    }
  }, [expandedPostId, loadComments]);

  const handleSubmitComment = useCallback(async (content: string) => {
    if (!user || !expandedPostId) return;
    const result = await createComment({
      user_id: user.id,
      post_id: expandedPostId,
      content,
      parent_comment_id: replyTo?.id,
    });
    if (!result.error) {
      setReplyTo(null);
      await loadComments(expandedPostId);
      // Update local comment count
      setPosts((prev) => prev.map((p) =>
        p.id === expandedPostId ? { ...p, comment_count: p.comment_count + 1 } : p
      ));
    }
  }, [user, expandedPostId, replyTo, loadComments]);

  const handleEditComment = useCallback((comment: CommentWithAuthor) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setReplyTo(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingComment || !user || !editText.trim() || !expandedPostId) return;
    const result = await updateComment(editingComment.id, editText.trim(), user.id);
    if (!result.error) {
      setEditingComment(null);
      setEditText('');
      await loadComments(expandedPostId);
    }
  }, [editingComment, user, editText, expandedPostId, loadComments]);

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
    setEditText('');
  }, []);

  const handleCommentDeleted = useCallback(async () => {
    if (!expandedPostId) return;
    await loadComments(expandedPostId);
    setPosts((prev) => prev.map((p) =>
      p.id === expandedPostId ? { ...p, comment_count: Math.max(0, p.comment_count - 1) } : p
    ));
  }, [expandedPostId, loadComments]);

  const visibleComments = comments.slice(0, visibleCount);
  const hasMoreComments = visibleCount < comments.length;

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
              <YStack paddingHorizontal="$md" paddingBottom="$sm" backgroundColor="$surface">
                {editingComment ? (
                  <YStack marginBottom="$sm">
                    <TextInput
                      style={{
                        fontSize: 14,
                        fontWeight: '400',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        maxHeight: 80,
                        borderColor: theme.borderColor.val,
                        color: theme.color.val,
                      }}
                      value={editText}
                      onChangeText={setEditText}
                      autoFocus
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={handleSaveEdit}
                      onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Escape') handleCancelEdit(); }}
                    />
                    <XStack justifyContent="flex-end" marginTop="$xs">
                      <TouchableOpacity onPress={handleCancelEdit}>
                        <Text fontSize="$2" marginRight="$md" color="$colorSecondary">Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveEdit} disabled={!editText.trim()}>
                        <Text fontSize="$2" fontWeight="600" color="$color">Save</Text>
                      </TouchableOpacity>
                    </XStack>
                  </YStack>
                ) : (
                  <CommentInput
                    ref={commentInputRef}
                    onSubmit={handleSubmitComment}
                    replyingTo={replyTo?.username}
                    onCancelReply={() => setReplyTo(null)}
                    disabled={!canComment}
                    disabledMessage="Commenting is a paid feature. Upgrade to join the conversation!"
                    noBorder
                  />
                )}
                <YStack height={1} marginHorizontal={-16} backgroundColor="$borderColor" />
                {commentsLoading ? (
                  <ActivityIndicator style={{ paddingVertical: 16 }} color={theme.colorSecondary.val} />
                ) : comments.length === 0 ? (
                  <Text fontSize="$1" textAlign="center" paddingVertical="$md" color="$colorSecondary">No comments yet</Text>
                ) : (
                  <>
                    {visibleComments.map((comment, idx) => (
                      <YStack key={comment.id} paddingTop="$sm">
                        <CommentItem
                          comment={comment}
                          noBorder={idx === visibleComments.length - 1}
                          onReply={(id, username) => { setReplyTo({ id, username }); commentInputRef.current?.focus(); }}
                          onEdit={handleEditComment}
                          onReport={(commentId) => setReportTarget({ visible: true, contentType: 'comment', contentId: commentId })}
                          onDeleted={handleCommentDeleted}
                        />
                      </YStack>
                    ))}
                    {hasMoreComments && (
                      <TouchableOpacity
                        style={{ paddingVertical: 8, alignItems: 'center' }}
                        onPress={() => setVisibleCount((c) => c + COMMENTS_PAGE_SIZE)}
                      >
                        <Text fontSize="$1" color="$colorSecondary">
                          Show more comments ({comments.length - visibleCount} remaining)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                <YStack height={1} marginHorizontal={-16} backgroundColor="$borderColor" />
              </YStack>
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
