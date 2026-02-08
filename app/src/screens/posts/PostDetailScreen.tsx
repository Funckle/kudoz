import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput } from 'react-native';
import { PostCard } from '../../components/PostCard';
import { CommentItem } from '../../components/CommentItem';
import { CommentInput } from '../../components/CommentInput';
import { ReportModal } from '../../components/ReportModal';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { getPost } from '../../services/posts';
import { getCommentsForPost, createComment, updateComment } from '../../services/comments';
import type { PostWithAuthor, CommentWithAuthor, ContentType } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function PostDetailScreen({ route, navigation }: HomeScreenProps<'PostDetail'>) {
  const { postId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const { canComment } = useSubscription();
  const [post, setPost] = useState<PostWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ visible: boolean; contentType: ContentType; contentId: string }>({ visible: false, contentType: 'post', contentId: '' });
  const [editingComment, setEditingComment] = useState<CommentWithAuthor | null>(null);
  const [editText, setEditText] = useState('');

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

  const handleEditComment = (comment: CommentWithAuthor) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setReplyTo(null);
  };

  const handleSaveEdit = async () => {
    if (!editingComment || !user || !editText.trim()) return;
    const result = await updateComment(editingComment.id, editText.trim(), user.id);
    if (!result.error) {
      setEditingComment(null);
      setEditText('');
      loadData();
    }
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  if (loading) return <LoadingSpinner />;
  if (error || !post) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
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
            onEdit={() => navigation.getParent()?.navigate('CreateModal', { screen: 'EditPost', params: { postId: post.id } })}
            onReport={() => setReportTarget({ visible: true, contentType: 'post', contentId: post.id })}
            onDeleted={() => navigation.goBack()}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <CommentItem
              comment={item}
              onReply={(id, username) => setReplyTo({ id, username })}
              onEdit={handleEditComment}
              onReport={(commentId) => setReportTarget({ visible: true, contentType: 'comment', contentId: commentId })}
              onDeleted={loadData}
            />
          </View>
        )}
        contentContainerStyle={styles.content}
      />
      {editingComment ? (
        <View style={[styles.editBar, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
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
  content: {
    flexGrow: 1,
  },
  commentContainer: {
    paddingHorizontal: spacing.md,
  },
  editBar: {
    borderTopWidth: 1,
    padding: spacing.sm,
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
