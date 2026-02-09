import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { CommentItem } from './CommentItem';
import { CommentInput, CommentInputHandle } from './CommentInput';
import { getCommentsForPost, createComment, updateComment } from '../services/comments';
import type { CommentWithAuthor } from '../types/database';

const COMMENTS_PAGE_SIZE = 10;

interface InlineCommentsProps {
  postId: string;
  userId: string;
  canComment: boolean;
  onCommentCountChange: (delta: number) => void;
  onReport: (commentId: string) => void;
}

export function InlineComments({ postId, userId, canComment, onCommentCountChange, onReport }: InlineCommentsProps) {
  const theme = useTheme();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [editingComment, setEditingComment] = useState<CommentWithAuthor | null>(null);
  const [editText, setEditText] = useState('');
  const commentInputRef = useRef<CommentInputHandle>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    const result = await getCommentsForPost(postId);
    setComments(result.comments);
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = useCallback(async (content: string) => {
    const result = await createComment({
      user_id: userId,
      post_id: postId,
      content,
      parent_comment_id: replyTo?.id,
    });
    if (!result.error) {
      setReplyTo(null);
      await loadComments();
      onCommentCountChange(1);
    }
  }, [userId, postId, replyTo, loadComments, onCommentCountChange]);

  const handleEditComment = useCallback((comment: CommentWithAuthor) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setReplyTo(null);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingComment || !editText.trim()) return;
    const result = await updateComment(editingComment.id, editText.trim(), userId);
    if (!result.error) {
      setEditingComment(null);
      setEditText('');
      await loadComments();
    }
  }, [editingComment, editText, userId, loadComments]);

  const handleCancelEdit = useCallback(() => {
    setEditingComment(null);
    setEditText('');
  }, []);

  const handleCommentDeleted = useCallback(async () => {
    await loadComments();
    onCommentCountChange(-1);
  }, [loadComments, onCommentCountChange]);

  const visibleComments = comments.slice(0, visibleCount);
  const hasMoreComments = visibleCount < comments.length;

  return (
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
      {loading ? (
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
                onReport={(commentId) => onReport(commentId)}
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
  );
}
