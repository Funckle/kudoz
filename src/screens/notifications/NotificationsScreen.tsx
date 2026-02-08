import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, RefreshControl, TouchableOpacity, Text, View } from 'react-native';
import { NotificationItem } from '../../components/NotificationItem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications, markAsRead, markAllRead } from '../../services/notifications';
import type { NotificationWithData } from '../../types/database';
import type { NotificationsScreenProps } from '../../types/navigation';

export function NotificationsScreen({ navigation }: NotificationsScreenProps<'Notifications'>) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationWithData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const { notifications: n } = await getNotifications(user.id);
    setNotifications(n);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handlePress = async (notification: NotificationWithData) => {
    if (!notification.read) {
      await markAsRead(notification.id);
      setNotifications((prev) => prev.map((n) => n.id === notification.id ? { ...n, read: true } : n));
    }

    const data = notification.data as Record<string, string>;
    switch (notification.type) {
      case 'kudoz':
      case 'comment':
        if (data.post_id) navigation.navigate('PostDetail', { postId: data.post_id });
        break;
      case 'follow':
      case 'mutual_follow':
        if (data.actor_id) navigation.navigate('UserProfile', { userId: data.actor_id });
        break;
      case 'goal_completed':
        if (data.goal_id) navigation.navigate('GoalDetail', { goalId: data.goal_id });
        break;
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) return <LoadingSpinner />;

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {hasUnread && (
        <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
          <Text style={[styles.markAllText, { color: colors.text }]}>Mark all as read</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => handlePress(item)} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadNotifications(); }} />}
        ListEmptyComponent={<EmptyState title="No notifications yet" message="When someone interacts with you, you'll see it here." />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  markAllBtn: { padding: spacing.md, alignItems: 'flex-end' },
  markAllText: { ...typography.caption, fontWeight: '600' },
});
