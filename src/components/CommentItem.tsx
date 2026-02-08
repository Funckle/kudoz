import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Reply, Pencil, Trash2, Flag } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { deleteComment } from '../services/comments';
import type { CommentWithAuthor } from '../types/database';

interface CommentItemProps {
  comment: CommentWithAuthor;
  depth?: number;
  parentUsername?: string;
  onReply?: (commentId: string, username: string) => void;
  onEdit?: (comment: CommentWithAuthor) => void;
  onReport?: (commentId: string) => void;
  onDeleted?: () => void;
}

export function CommentItem({ comment, depth = 0, parentUsername, onReply, onEdit, onReport, onDeleted }: CommentItemProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const isOwner = user?.id === comment.user_id;
  const showReplyingTo = depth >= 2 && parentUsername;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const formatDate = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const canEdit = () => {
    if (!isOwner) return false;
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;
    return new Date(comment.created_at).getTime() > fiveMinAgo;
  };

  const handleDelete = () => {
    Alert.alert('Delete comment?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteComment(comment.id);
          onDeleted?.();
        },
      },
    ]);
  };

  return (
    <View style={[
      depth === 0 && { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginBottom: spacing.sm },
    ]}>
      {/* Comment content */}
      <View style={styles.row}>
        <Avatar uri={comment.user?.avatar_url} name={comment.user?.name} size={32} />
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: colors.text }]}>{comment.user?.name}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>{formatDate(comment.created_at)}</Text>
            {comment.updated_at && <Text style={[styles.edited, { color: colors.textSecondary }]}>(edited)</Text>}
          </View>
          {showReplyingTo && (
            <Text style={[styles.replyingTo, { color: colors.textSecondary }]}>replying to @{parentUsername}</Text>
          )}
          <Text style={[styles.content, { color: colors.text }]}>{comment.content}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => onReply?.(comment.id, comment.user?.username || '')}>
              <Reply size={13} color={colors.textSecondary} />
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>Reply</Text>
            </TouchableOpacity>
            {canEdit() && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit?.(comment)}>
                <Pencil size={13} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>Edit</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                <Trash2 size={13} color={colors.error} />
                <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
            {!isOwner && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => onReport?.(comment.id)}>
                <Flag size={13} color={colors.textSecondary} />
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {/* Replies — indented once with thread line, no extra nesting */}
      {hasReplies && (
        <View style={[styles.repliesContainer, { marginLeft: depth === 0 ? 24 : 0, borderLeftColor: colors.borderLight }]}>
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              parentUsername={comment.user?.username}
              onReply={onReply}
              onEdit={onEdit}
              onReport={onReport}
              onDeleted={onDeleted}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  body: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    ...typography.caption,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  time: {
    ...typography.caption,
  },
  edited: {
    ...typography.caption,
    fontStyle: 'italic',
    marginLeft: spacing.xs,
  },
  replyingTo: {
    ...typography.caption,
    fontStyle: 'italic',
    marginTop: 1,
  },
  content: {
    ...typography.body,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    ...typography.caption,
    marginLeft: 4,
  },
  repliesContainer: {
    borderLeftWidth: 2,
    paddingLeft: spacing.sm,
    marginTop: spacing.xs,
  },
});
