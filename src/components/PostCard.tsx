import React, { useCallback } from 'react';
import { TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import * as DropdownMenu from 'zeego/dropdown-menu';
import { Avatar } from './Avatar';
import { CategoryBadge } from './CategoryBadge';
import { KudozButton } from './KudozButton';
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
  isExpanded?: boolean;
}

export const PostCard = React.memo(function PostCard({
  post,
  onPressAuthor,
  onPressGoal,
  onPressComments,
  onPressPost,
  onEdit,
  onReport,
  onDeleted,
  isExpanded,
}: PostCardProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const isOwner = user?.id === post.user_id;

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

  const handleDelete = useCallback(async () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Delete post? This action cannot be undone. Progress will be reversed.')) {
        await deletePost(post.id);
        onDeleted?.();
      }
    } else {
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
    }
  }, [post.id, onDeleted]);

  const postTypeLabel = post.post_type === 'goal_created'
    ? 'started a goal'
    : post.post_type === 'goal_completed'
    ? 'completed a goal'
    : 'posted an update';

  return (
    <TouchableOpacity onPress={onPressPost} activeOpacity={0.8}>
      <YStack padding="$md" backgroundColor="$surface" borderBottomWidth={1} borderBottomColor="$borderColor">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$sm">
          <TouchableOpacity onPress={onPressAuthor} style={{ flexDirection: 'row', flex: 1 }}>
            <Avatar uri={post.user?.avatar_url} name={post.user?.name} size={32} />
            <YStack marginLeft="$sm" flex={1}>
              <Text fontSize="$2" fontWeight="600" color="$color">{post.user?.name}</Text>
              <Text fontSize="$1" color="$colorSecondary">
                @{post.user?.username} · {postTypeLabel} · {formatDate(post.created_at)}
              </Text>
            </YStack>
          </TouchableOpacity>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text fontSize={18} color="$colorSecondary" paddingLeft="$sm">···</Text>
              </TouchableOpacity>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              style={{
                backgroundColor: theme.surface.val,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.borderColor.val,
                padding: 4,
                minWidth: 140,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              {isOwner ? (
                <>
                  {post.post_type === 'progress' && (
                    <DropdownMenu.Item
                      key="edit"
                      onSelect={() => onEdit?.()}
                      style={{ padding: '8px 12px', borderRadius: 4 }}
                    >
                      <DropdownMenu.ItemTitle style={{ fontSize: 14, color: theme.color.val }}>
                        Edit
                      </DropdownMenu.ItemTitle>
                    </DropdownMenu.Item>
                  )}
                  <DropdownMenu.Item
                    key="delete"
                    destructive
                    onSelect={handleDelete}
                    style={{ padding: '8px 12px', borderRadius: 4 }}
                  >
                    <DropdownMenu.ItemTitle style={{ fontSize: 14, color: theme.error.val }}>
                      Delete
                    </DropdownMenu.ItemTitle>
                  </DropdownMenu.Item>
                </>
              ) : (
                <DropdownMenu.Item
                  key="report"
                  onSelect={() => onReport?.()}
                  style={{ padding: '8px 12px', borderRadius: 4 }}
                >
                  <DropdownMenu.ItemTitle style={{ fontSize: 14, color: theme.color.val }}>
                    Report
                  </DropdownMenu.ItemTitle>
                </DropdownMenu.Item>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </XStack>

        {/* Goal link */}
        <TouchableOpacity onPress={onPressGoal}>
          <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginBottom="$xs">
            {post.goal?.title}
          </Text>
        </TouchableOpacity>

        {/* Content */}
        {post.content && (
          <Text fontSize="$2" color="$color" marginBottom="$sm">{post.content}</Text>
        )}

        {/* Progress chip */}
        {post.progress_value != null && post.progress_value > 0 && (
          <YStack
            alignSelf="flex-start"
            paddingHorizontal="$sm"
            paddingVertical="$xs"
            borderRadius="$md"
            backgroundColor="$borderColorLight"
            marginBottom="$sm"
          >
            <Text fontSize="$2" fontWeight="600" color="$color">
              +{post.goal?.goal_type === 'currency' ? `$${post.progress_value}` : post.progress_value}
            </Text>
          </YStack>
        )}

        {/* Media */}
        {post.media_url && (
          <YStack borderRadius={8} overflow="hidden" marginBottom="$sm">
            <Image
              source={{ uri: post.media_url }}
              style={{
                width: '100%',
                aspectRatio: (post.media_width || 1) / (post.media_height || 1),
              }}
              resizeMode="cover"
            />
          </YStack>
        )}

        {/* Edited label */}
        {post.edited_at && (
          <Text fontSize="$1" color="$colorSecondary" fontStyle="italic" marginBottom="$sm">
            edited
          </Text>
        )}

        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <XStack flexWrap="wrap" marginBottom="$sm">
            {post.categories.map((c) => <CategoryBadge key={c.id} category={c} />)}
          </XStack>
        )}

        {/* Actions */}
        <XStack alignItems="center">
          <KudozButton postId={post.id} initialCount={post.kudoz_count} initialActive={post.has_kudozd} />
          <TouchableOpacity
            onPress={onPressComments}
            style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16, paddingVertical: 4 }}
          >
            <MessageCircle size={14} color={theme.colorSecondary.val} />
            <Text fontSize="$1" color="$colorSecondary" marginLeft={4}>
              {post.comment_count > 0 ? `${post.comment_count} comments` : 'Comment'}
            </Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
    </TouchableOpacity>
  );
}, (prev, next) => {
  return prev.post.id === next.post.id
    && prev.post.kudoz_count === next.post.kudoz_count
    && prev.post.comment_count === next.post.comment_count
    && prev.post.has_kudozd === next.post.has_kudozd
    && prev.post.edited_at === next.post.edited_at
    && prev.post.content === next.post.content
    && prev.isExpanded === next.isExpanded;
});
