import React from 'react';
import { TouchableOpacity } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { Avatar } from './Avatar';
import type { NotificationWithData } from '../types/database';

interface NotificationItemProps {
  notification: NotificationWithData;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const getMessage = () => {
    const name = notification.actor?.name || 'Someone';
    switch (notification.type) {
      case 'kudoz':
        return `${name} gave you Kudoz`;
      case 'comment_kudoz':
        return `${name} gave Kudoz to your comment`;
      case 'comment':
        return `${name} commented on your post`;
      case 'follow':
        return `${name} followed you`;
      case 'mutual_follow':
        return `You and ${name} are now mutual followers`;
      case 'goal_completed':
        return `${name} completed a goal: ${(notification.data as Record<string, string>).goal_title || ''}`;
      case 'subscription_expiring':
        return 'Your subscription expires soon';
      case 'subscription_expired':
        return 'Your subscription has expired';
      case 'weekly_summary':
        return (notification.data as Record<string, string>).message || 'Check your weekly progress';
      case 'social_digest':
        return (notification.data as Record<string, string>).message || 'Your friends made progress this week';
      case 'quarterly_reflection':
        return (notification.data as Record<string, string>).message || 'Reflect on your progress';
      case 'milestone_reached':
        return (notification.data as Record<string, string>).message || "You've hit your target!";
      case 'target_date_reached':
        return (notification.data as Record<string, string>).message || 'Your goal target date has arrived';
      default:
        return 'New notification';
    }
  };

  const formatDate = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <XStack
        alignItems="center"
        padding="$md"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor={!notification.read ? '$borderColorLight' : 'transparent'}
      >
        <Avatar uri={notification.actor?.avatar_url} name={notification.actor?.name} size={32} />
        <YStack flex={1} marginLeft="$sm">
          <Text fontSize="$2" color="$color">{getMessage()}</Text>
          <Text fontSize="$1" color="$colorSecondary" marginTop={2}>{formatDate(notification.created_at)}</Text>
        </YStack>
        {!notification.read && (
          <YStack width={8} height={8} borderRadius={4} backgroundColor="$color" />
        )}
      </XStack>
    </TouchableOpacity>
  );
}
