import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { PostCard } from '../../components/PostCard';
import { CommentItem } from '../../components/CommentItem';
import { CommentInput } from '../../components/CommentInput';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { colors, spacing } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { getPost } from '../../services/posts';
import { getCommentsForPost, createComment } from '../../services/comments';
import type { PostWithAuthor, CommentWithAuthor } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function PostDetailScreen({ route, navigation }: HomeScreenProps<'PostDetail'>) {
  const { postId } = route.params;
  const { user } = useAuth();
  const { canComment } = useSubscription();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  const loadData = useCallback(async () => {
    const [postResult, commentsResult] = await Promise.all([
      getPost(postId),
      getCommentsForPost(postId),
    ]);
    if (postResult.error) setError(postResult.error);
    if (postResult.post) setPost(postResult.post);
    if (commentsResult.comments) setComments(commentsResult.comments);
    setLoading(false);
  }, [postId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSubmitComment = async (content: string) => {
    if (!user) return;
    const result = await createComment({
      user_id: user.id,
      post_id: postId,
      content,
      parent_comment_id: replyTo?.id,
    });
    if (!result.error) {
      setReplyTo(null);
      loadData();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !post) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={88}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <PostCard
            post={post}
            onPressAuthor={() => navigation.navigate('UserProfile', { userId: post.user_id })}
            onPressGoal={() => navigation.navigate('GoalDetail', { goalId: post.goal_id })}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <CommentItem
              comment={item}
              onReply={(id, username) => setReplyTo({ id, username })}
              onDeleted={loadData}
            />
          </View>
        )}
        contentContainerStyle={styles.content}
      />
      <CommentInput
        onSubmit={handleSubmitComment}
        replyingTo={replyTo?.username}
        onCancelReply={() => setReplyTo(null)}
        disabled={!canComment}
        disabledMessage="Commenting is a paid feature. Upgrade to join the conversation!"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flexGrow: 1,
  },
  commentContainer: {
    paddingHorizontal: spacing.md,
  },
});
