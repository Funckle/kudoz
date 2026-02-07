import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Avatar } from './Avatar';
import { KudozButton } from './KudozButton';
import { colors, typography, spacing, borderRadius, borders } from '../utils/theme';
import type { PostWithAuthor } from '../types/database';
import { useAuth } from '../hooks/useAuth';
import { deletePost } from '../services/posts';

interface PostCardProps {
  post: PostWithAuthor;
  onPressAuthor?: () => void;
  onPressGoal?: () => void;
  onPressComments?: () => void;
  onPressPost?: () => void;
  onEdit?: () => void;
  onReport?: () => void;
  onDeleted?: () => void;
}

export function PostCard({
  post,
  onPressAuthor,
  onPressGoal,
  onPressComments,
  onPressPost,
  onEdit,
  onReport,
  onDeleted,
}: PostCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const handleDelete = useCallback(() => {
    Alert.alert('Delete post?', 'This action cannot be undone. Progress will be reversed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePost(post.id);
          onDeleted?.();
        },
      },
    ]);
  }, [post.id, onDeleted]);

  const handleMenu = () => {
    const options: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }> = [];
    if (isOwner) {
      if (post.post_type === 'progress') {
        options.push({ text: 'Edit', onPress: onEdit });
      }
      options.push({ text: 'Delete', onPress: handleDelete, style: 'destructive' });
    } else {
      options.push({ text: 'Report', onPress: onReport });
    }
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Options', '', options);
  };

  const postTypeLabel = post.post_type === 'goal_created'
    ? 'started a goal'
    : post.post_type === 'goal_completed'
    ? 'completed a goal'
    : 'posted an update';

  return (
    <TouchableOpacity style={styles.card} onPress={onPressPost} activeOpacity={0.8}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onPressAuthor} style={styles.authorRow}>
          <Avatar uri={post.user?.avatar_url} name={post.user?.name} size={32} />
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.user?.name}</Text>
            <Text style={styles.meta}>
              @{post.user?.username} · {postTypeLabel} · {formatDate(post.created_at)}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMenu} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.menuDots}>···</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onPressGoal}>
        <Text style={styles.goalLink}>{post.goal?.title}</Text>
      </TouchableOpacity>

      {post.content && <Text style={styles.content}>{post.content}</Text>}

      {post.progress_value != null && post.progress_value > 0 && (
        <View style={styles.progressChip}>
          <Text style={styles.progressText}>
            +{post.goal?.goal_type === 'currency' ? `$${post.progress_value}` : post.progress_value}
          </Text>
        </View>
      )}

      {post.media_url && (
        <Image
          source={{ uri: post.media_url }}
          style={[styles.image, { aspectRatio: (post.media_width || 1) / (post.media_height || 1) }]}
          resizeMode="cover"
        />
      )}

      {post.edited_at && <Text style={styles.edited}>edited</Text>}

      <View style={styles.actions}>
        <KudozButton postId={post.id} initialCount={post.kudoz_count} initialActive={post.has_kudozd} />
        <TouchableOpacity onPress={onPressComments} style={styles.commentBtn}>
          <Text style={styles.commentText}>
            {post.comment_count > 0 ? `${post.comment_count} comments` : 'Comment'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderBottomWidth: borders.width,
    borderBottomColor: borders.color,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    flex: 1,
  },
  authorInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  authorName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.black,
  },
  meta: {
    ...typography.caption,
    color: colors.gray,
  },
  menuDots: {
    fontSize: 18,
    color: colors.gray,
    paddingLeft: spacing.sm,
  },
  goalLink: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: spacing.sm,
  },
  content: {
    ...typography.body,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  progressChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.grayLighter,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius,
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.black,
  },
  image: {
    width: '100%',
    borderRadius,
    marginBottom: spacing.sm,
    maxHeight: 300,
  },
  edited: {
    ...typography.caption,
    color: colors.gray,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentBtn: {
    marginLeft: spacing.md,
    paddingVertical: spacing.xs,
  },
  commentText: {
    ...typography.caption,
    color: colors.gray,
  },
});
