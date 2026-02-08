import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(userId: string): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });
  const token = tokenData.data;

  // Upsert token to push_tokens table (supports multi-device)
  await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' }
  );

  return token;
}

export async function unregisterPushToken(token: string): Promise<void> {
  await supabase.from('push_tokens').delete().eq('token', token);
}

export type NotificationNavData = {
  type?: string;
  post_id?: string;
  goal_id?: string;
  actor_id?: string;
};

export function setupNotificationListeners(
  onNavigate?: (data: NotificationNavData) => void
) {
  const receivedSub = Notifications.addNotificationReceivedListener(() => {
    // Notification received while app is in foreground — no action needed
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as NotificationNavData;
    onNavigate?.(data);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}
