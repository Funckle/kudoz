import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';
import { NotificationItem } from '../../components/NotificationItem';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getNotifications, markAsRead, markAllRead } from '../../services/notifications';
import type { NotificationWithData } from '../../types/database';
import type { NotificationsScreenProps } from '../../types/navigation';

export function NotificationsScreen({ navigation }: NotificationsScreenProps<'Notifications'>) {
  const theme = useTheme();
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
      case 'kudos':
      case 'comment':
      case 'comment_kudos':
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
    <YStack flex={1} backgroundColor="$background">
      {hasUnread && (
        <TouchableOpacity style={{ padding: 16, alignItems: 'flex-end' }} onPress={handleMarkAllRead}>
          <Text fontSize="$1" fontWeight="600" color="$color">Mark all as read</Text>
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
    </YStack>
  );
}
