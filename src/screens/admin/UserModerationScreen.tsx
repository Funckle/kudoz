import React, { useState, useCallback } from 'react';
import { FlatList, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/supabase';
import {
  getViolationHistory,
  getSuggestedAction,
  suspendUser,
  banUser,
  liftSuspension,
} from '../../services/admin';
import { formatTimeAgo } from '../../utils/format';
import type { User, ModerationActionWithModerator } from '../../types/database';
import type { ProfileScreenProps } from '../../types/navigation';

const ACTION_LABELS: Record<string, string> = {
  warn: 'Warning',
  remove_content: 'Content Removed',
  suspend: 'Suspended',
  ban: 'Banned',
  dismiss: 'Dismissed',
  lift_suspension: 'Suspension Lifted',
};

export function UserModerationScreen({ route, navigation }: ProfileScreenProps<'UserModeration'>) {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  const { userId } = route.params;
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [actions, setActions] = useState<ModerationActionWithModerator[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const loadData = useCallback(async () => {
    const [{ data: userData }, historyResult] = await Promise.all([
      supabase.from('users').select('*').eq('id', userId).single(),
      getViolationHistory(userId),
    ]);
    if (userData) setTargetUser(userData as User);
    setActions(historyResult.actions);
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const moderatorId = currentUser?.id;

  const isSuspended = targetUser?.suspended_until
    ? new Date(targetUser.suspended_until) > new Date()
    : false;
  const isBanned = targetUser?.suspended_until
    ? new Date(targetUser.suspended_until).getFullYear() >= 9999
    : false;

  const statusLabel = isBanned ? 'Banned' : isSuspended ? 'Suspended' : 'Active';
  const statusColor = isBanned || isSuspended ? '$error' : '$color';

  const handleLiftSuspension = () => {
    if (!moderatorId) return;
    Alert.alert('Lift suspension?', 'This will restore the user\'s ability to post and interact.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Lift',
        onPress: async () => {
          setActing(true);
          const result = await liftSuspension(userId, moderatorId);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          loadData();
        },
      },
    ]);
  };

  const handleSuspend = () => {
    if (!moderatorId) return;
    Alert.alert('Suspend user', 'Choose suspension duration:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: '3 days',
        onPress: async () => {
          setActing(true);
          await suspendUser(userId, 3, 'Manual suspension', undefined, moderatorId);
          setActing(false);
          loadData();
        },
      },
      {
        text: '7 days',
        onPress: async () => {
          setActing(true);
          await suspendUser(userId, 7, 'Manual suspension', undefined, moderatorId);
          setActing(false);
          loadData();
        },
      },
      {
        text: '30 days',
        onPress: async () => {
          setActing(true);
          await suspendUser(userId, 30, 'Manual suspension', undefined, moderatorId);
          setActing(false);
          loadData();
        },
      },
    ]);
  };

  const handleBan = () => {
    if (!moderatorId) return;
    Alert.alert('Ban user permanently?', 'This user will be permanently banned.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          await banUser(userId, 'Manual ban', undefined, moderatorId);
          setActing(false);
          loadData();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;
  if (!targetUser) return <ScreenContainer><Text padding="$md" color="$color">User not found</Text></ScreenContainer>;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Info */}
        <XStack alignItems="center" marginBottom="$lg">
          <Avatar uri={targetUser.avatar_url} name={targetUser.name} size={56} />
          <YStack flex={1} marginLeft="$sm">
            <Text fontSize="$4" fontWeight="700" color="$color">{targetUser.name}</Text>
            <Text fontSize="$2" color="$colorSecondary">@{targetUser.username}</Text>
          </YStack>
          <YStack
            backgroundColor={isBanned || isSuspended ? '$error' : '$borderColorLight'}
            borderRadius={10}
            paddingHorizontal={10}
            paddingVertical={4}
          >
            <Text
              fontSize="$1"
              fontWeight="600"
              color={isBanned || isSuspended ? 'white' : '$colorSecondary'}
            >
              {statusLabel}
            </Text>
          </YStack>
        </XStack>

        {/* Suspension details */}
        {isSuspended && !isBanned && targetUser.suspended_until && (
          <YStack
            padding="$md"
            borderRadius={8}
            borderWidth={1}
            borderColor="$error"
            backgroundColor="$surface"
            marginBottom="$md"
          >
            <Text fontSize="$2" color="$error" fontWeight="600">
              Suspended until {new Date(targetUser.suspended_until).toLocaleDateString()}
            </Text>
            {targetUser.suspension_reason && (
              <Text fontSize="$2" color="$colorSecondary" marginTop="$xs">
                Reason: {targetUser.suspension_reason}
              </Text>
            )}
          </YStack>
        )}

        {/* Quick Actions */}
        <YStack gap="$sm" marginBottom="$lg">
          {(isSuspended || isBanned) && (
            <Button title="Lift Suspension" onPress={handleLiftSuspension} disabled={acting} />
          )}
          {!isSuspended && (
            <>
              <Button title="Suspend User" onPress={handleSuspend} variant="secondary" disabled={acting} />
              <Button title="Ban User" onPress={handleBan} variant="destructive" disabled={acting} />
            </>
          )}
        </YStack>

        {/* Moderation History */}
        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginBottom="$sm" textTransform="uppercase">
          Moderation History
        </Text>

        {actions.length === 0 ? (
          <Text fontSize="$2" color="$colorSecondary" paddingVertical="$md">No moderation history</Text>
        ) : (
          actions.map((action) => (
            <YStack
              key={action.id}
              padding="$sm"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize="$2" fontWeight="600" color="$color">
                  {ACTION_LABELS[action.action_type] || action.action_type}
                </Text>
                <Text fontSize={11} color="$colorSecondary">{formatTimeAgo(action.created_at)}</Text>
              </XStack>
              {action.notes && (
                <Text fontSize="$1" color="$colorSecondary" marginTop={2}>{action.notes}</Text>
              )}
              {action.moderator && (
                <Text fontSize={11} color="$colorSecondary" marginTop={2}>
                  by @{action.moderator.username}
                </Text>
              )}
            </YStack>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
