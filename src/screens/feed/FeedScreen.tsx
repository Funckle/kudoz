import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform, Keyboard, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PostCard } from '../../components/PostCard';
import { CommentItem } from '../../components/CommentItem';
import { CommentInput } from '../../components/CommentInput';
import { ReportModal } from '../../components/ReportModal';
import { SubscriptionBanner } from '../../components/SubscriptionBanner';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { ErrorState } from '../../components/ErrorState';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
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
  const { colors } = useTheme();
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

  // Scroll to bottom of expanded post when keyboard opens so CommentInput is visible
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidShow', () => {
      if (!expandedPostId) return;
      const index = posts.findIndex((p) => p.id === expandedPostId);
      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ index, viewPosition: 1, animated: true });
      }
    });
    return () => sub.remove();
  }, [expandedPostId, posts]);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={88}
    >
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          isLapsed && !bannerDismissed ? (
            <SubscriptionBanner
              onUpgrade={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'Subscription' })}
              onDismiss={() => setBannerDismissed(true)}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <View>
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
              <View style={[styles.commentsSection, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {commentsLoading ? (
                  <ActivityIndicator style={styles.commentsLoader} color={colors.textSecondary} />
                ) : comments.length === 0 ? (
                  <Text style={[styles.noComments, { color: colors.textSecondary }]}>No comments yet</Text>
                ) : (
                  <>
                    {visibleComments.map((comment) => (
                      <View key={comment.id} style={styles.commentContainer}>
                        <CommentItem
                          comment={comment}
                          onReply={(id, username) => setReplyTo({ id, username })}
                          onEdit={handleEditComment}
                          onReport={(commentId) => setReportTarget({ visible: true, contentType: 'comment', contentId: commentId })}
                          onDeleted={handleCommentDeleted}
                        />
                      </View>
                    ))}
                    {hasMoreComments && (
                      <TouchableOpacity
                        style={styles.loadMoreBtn}
                        onPress={() => setVisibleCount((c) => c + COMMENTS_PAGE_SIZE)}
                      >
                        <Text style={[styles.loadMoreText, { color: colors.textSecondary }]}>
                          Show more comments ({comments.length - visibleCount} remaining)
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
                {editingComment ? (
                  <View style={styles.editBar}>
                    <TextInput
                      style={[styles.editInput, { borderColor: colors.border, color: colors.text }]}
                      value={editText}
                      onChangeText={setEditText}
                      autoFocus
                      returnKeyType="done"
                      blurOnSubmit
                      onSubmitEditing={handleSaveEdit}
                      onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Escape') handleCancelEdit(); }}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={handleCancelEdit}>
                        <Text style={[styles.editCancel, { color: colors.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleSaveEdit} disabled={!editText.trim()}>
                        <Text style={[styles.editSave, { color: colors.text }]}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <CommentInput
                    onSubmit={handleSubmitComment}
                    replyingTo={replyTo?.username}
                    onCancelReply={() => setReplyTo(null)}
                    disabled={!canComment}
                    disabledMessage="Commenting is a paid feature. Upgrade to join the conversation!"
                  />
                )}
              </View>
            )}
          </View>
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
        style={[styles.list, { backgroundColor: colors.background }]}
        removeClippedSubviews={false}
      />
      <ReportModal
        visible={reportTarget.visible}
        contentType={reportTarget.contentType}
        contentId={reportTarget.contentId}
        onClose={() => setReportTarget({ visible: false, contentType: 'post', contentId: '' })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  commentsSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  commentsLoader: {
    paddingVertical: spacing.md,
  },
  noComments: {
    ...typography.caption,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  commentContainer: {
    paddingTop: spacing.sm,
  },
  loadMoreBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  loadMoreText: {
    ...typography.caption,
  },
  editBar: {
    marginTop: spacing.sm,
  },
  editInput: {
    ...typography.body,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    maxHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
  },
  editCancel: {
    ...typography.body,
    marginRight: spacing.md,
  },
  editSave: {
    ...typography.body,
    fontWeight: '600',
  },
});
