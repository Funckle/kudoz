import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Avatar } from './Avatar';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { deleteComment } from '../services/comments';
import type { CommentWithAuthor } from '../types/database';

interface CommentItemProps {
  comment: CommentWithAuthor;
  depth?: number;
  onReply?: (commentId: string, username: string) => void;
  onEdit?: (comment: CommentWithAuthor) => void;
  onReport?: (commentId: string) => void;
  onDeleted?: () => void;
}

export function CommentItem({ comment, depth = 0, onReply, onEdit, onReport, onDeleted }: CommentItemProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const isOwner = user?.id === comment.user_id;
  const indent = Math.min(depth, 3) * 24;

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
    <View style={[styles.container, { marginLeft: indent }]}>
      <View style={styles.row}>
        <Avatar uri={comment.user?.avatar_url} name={comment.user?.name} size={32} />
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={[styles.name, { color: colors.text }]}>{comment.user?.name}</Text>
            <Text style={[styles.time, { color: colors.textSecondary }]}>{formatDate(comment.created_at)}</Text>
            {comment.updated_at && <Text style={[styles.edited, { color: colors.textSecondary }]}>(edited)</Text>}
          </View>
          <Text style={[styles.content, { color: colors.text }]}>{comment.content}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => onReply?.(comment.id, comment.user?.username || '')}>
              <Text style={[styles.action, { color: colors.textSecondary }]}>Reply</Text>
            </TouchableOpacity>
            {canEdit() && (
              <TouchableOpacity onPress={() => onEdit?.(comment)}>
                <Text style={[styles.action, { color: colors.textSecondary }]}>Edit</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <TouchableOpacity onPress={handleDelete}>
                <Text style={[styles.action, { color: colors.error }]}>Delete</Text>
              </TouchableOpacity>
            )}
            {!isOwner && (
              <TouchableOpacity onPress={() => onReport?.(comment.id)}>
                <Text style={[styles.action, { color: colors.textSecondary }]}>Report</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          onReply={onReply}
          onEdit={onEdit}
          onReport={onReport}
          onDeleted={onDeleted}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
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
  content: {
    ...typography.body,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  action: {
    ...typography.caption,
    marginRight: spacing.md,
  },
});
