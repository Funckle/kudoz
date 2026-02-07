import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { colors, typography, spacing, borders } from '../utils/theme';
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
    <TouchableOpacity
      style={[styles.container, !notification.read && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar uri={notification.actor?.avatar_url} name={notification.actor?.name} size={32} />
      <View style={styles.body}>
        <Text style={styles.message}>{getMessage()}</Text>
        <Text style={styles.time}>{formatDate(notification.created_at)}</Text>
      </View>
      {!notification.read && <View style={styles.dot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: borders.width,
    borderBottomColor: borders.color,
  },
  unread: {
    backgroundColor: colors.grayLighter,
  },
  body: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.black,
  },
  time: {
    ...typography.caption,
    color: colors.gray,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.black,
  },
});
