import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar } from './Avatar';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import type { NotificationWithData } from '../types/database';

interface NotificationItemProps {
  notification: NotificationWithData;
  onPress: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const { colors } = useTheme();

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
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: colors.border },
        !notification.read && { backgroundColor: colors.borderLight },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar uri={notification.actor?.avatar_url} name={notification.actor?.name} size={32} />
      <View style={styles.body}>
        <Text style={[styles.message, { color: colors.text }]}>{getMessage()}</Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{formatDate(notification.created_at)}</Text>
      </View>
      {!notification.read && <View style={[styles.dot, { backgroundColor: colors.text }]} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  message: {
    ...typography.body,
  },
  time: {
    ...typography.caption,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
