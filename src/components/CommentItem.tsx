import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Reply, Pencil, Trash2, Flag } from 'lucide-react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { Avatar } from './Avatar';
import { CommentKudosButton } from './CommentKudosButton';
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
  noBorder?: boolean;
}

export const CommentItem = React.memo(function CommentItem({ comment, depth = 0, parentUsername, onReply, onEdit, onReport, onDeleted, noBorder }: CommentItemProps) {
  const { user } = useAuth();
  const theme = useTheme();
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
    <YStack
      {...(depth === 0 && !noBorder ? {
        borderBottomWidth: 1,
        borderBottomColor: '$borderColor',
        paddingBottom: '$sm',
        marginBottom: '$sm',
      } : {})}
    >
      <XStack marginBottom="$xs">
        <Avatar uri={comment.user?.avatar_url} name={comment.user?.name} size={32} />
        <YStack flex={1} marginLeft="$sm">
          <XStack alignItems="center">
            <Text fontSize="$1" fontWeight="600" color="$color" marginRight="$xs">
              {comment.user?.name}
            </Text>
            <Text fontSize="$1" color="$colorSecondary">{formatDate(comment.created_at)}</Text>
            {comment.updated_at && (
              <Text fontSize="$1" color="$colorSecondary" fontStyle="italic" marginLeft="$xs">
                (edited)
              </Text>
            )}
          </XStack>
          {showReplyingTo && (
            <Text fontSize="$1" color="$colorSecondary" fontStyle="italic" marginTop={1}>
              replying to @{parentUsername}
            </Text>
          )}
          <Text fontSize="$2" color="$color" marginTop={2}>{comment.content}</Text>
          <XStack marginTop="$sm">
            <CommentKudosButton
              commentId={comment.id}
              initialCount={comment.kudos_count}
              initialActive={comment.has_given_kudos}
            />
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
              onPress={() => onReply?.(comment.id, comment.user?.username || '')}
            >
              <Reply size={13} color={theme.colorSecondary.val} />
              <Text fontSize="$1" color="$colorSecondary" marginLeft={4}>Reply</Text>
            </TouchableOpacity>
            {canEdit() && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                onPress={() => onEdit?.(comment)}
              >
                <Pencil size={13} color={theme.colorSecondary.val} />
                <Text fontSize="$1" color="$colorSecondary" marginLeft={4}>Edit</Text>
              </TouchableOpacity>
            )}
            {isOwner && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                onPress={handleDelete}
              >
                <Trash2 size={13} color={theme.error.val} />
                <Text fontSize="$1" color="$error" marginLeft={4}>Delete</Text>
              </TouchableOpacity>
            )}
            {!isOwner && (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}
                onPress={() => onReport?.(comment.id)}
              >
                <Flag size={13} color={theme.colorSecondary.val} />
                <Text fontSize="$1" color="$colorSecondary" marginLeft={4}>Report</Text>
              </TouchableOpacity>
            )}
          </XStack>
        </YStack>
      </XStack>
      {hasReplies && (
        <YStack
          marginLeft={depth === 0 ? 24 : 0}
          borderLeftWidth={2}
          borderLeftColor="$borderColorLight"
          paddingLeft="$sm"
          marginTop="$xs"
        >
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
        </YStack>
      )}
    </YStack>
  );
});
