import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { useFocusEffect } from '@react-navigation/native';
import { Avatar } from '../../components/Avatar';
import { GoalCard } from '../../components/GoalCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getUserGoals } from '../../services/goals';
import { getFollowerCount, getFollowingCount } from '../../services/follows';
import { Linking } from 'react-native';
import type { GoalWithCategories } from '../../types/database';
import type { ProfileScreenProps } from '../../types/navigation';

export function ProfileScreen({ navigation }: ProfileScreenProps<'Profile'>) {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeGoals, setActiveGoals] = useState<GoalWithCategories[]>([]);
  const [completedGoals, setCompletedGoals] = useState<GoalWithCategories[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    const [active, completed, fc, fic] = await Promise.all([
      getUserGoals(user.id, 'active'),
      getUserGoals(user.id, 'completed'),
      getFollowerCount(user.id),
      getFollowingCount(user.id),
    ]);
    setActiveGoals(active.goals);
    setCompletedGoals(completed.goals);
    setFollowers(fc);
    setFollowing(fic);
    setLoading(false);
  }, [user]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (!user) return <LoadingSpinner />;

  const goals = tab === 'active' ? activeGoals : completedGoals;

  const header = (
    <YStack padding="$md">
      <XStack alignItems="center">
        <Avatar uri={user.avatar_url} name={user.name} size={80} />
        <XStack flex={1} justifyContent="space-around" marginLeft="$md">
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('FollowList', { userId: user.id, type: 'followers' })}>
            <Text fontSize="$3" fontWeight="600" color="$color">{followers}</Text>
            <Text fontSize="$1" color="$colorSecondary">Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('FollowList', { userId: user.id, type: 'following' })}>
            <Text fontSize="$3" fontWeight="600" color="$color">{following}</Text>
            <Text fontSize="$1" color="$colorSecondary">Following</Text>
          </TouchableOpacity>
          <YStack alignItems="center">
            <Text fontSize="$3" fontWeight="600" color="$color">{completedGoals.length}</Text>
            <Text fontSize="$1" color="$colorSecondary">Achieved</Text>
          </YStack>
        </XStack>
      </XStack>
      <Text fontSize="$4" fontWeight="600" marginTop="$sm" color="$color">{user.name}</Text>
      <Text fontSize="$2" color="$colorSecondary">@{user.username}</Text>
      {user.bio ? <Text fontSize="$2" color="$color" marginTop="$xs">{user.bio}</Text> : null}
      {user.website ? (
        <TouchableOpacity onPress={() => Linking.openURL(user.website!.startsWith('http') ? user.website! : `https://${user.website}`)}>
          <Text fontSize="$2" color="$link" marginTop="$xs" numberOfLines={1}>{user.website}</Text>
        </TouchableOpacity>
      ) : null}
      <XStack marginTop="$md">
        <TouchableOpacity
          style={{ flex: 1, marginRight: 8, borderWidth: 1, borderColor: theme.borderColor.val, borderRadius: 8, paddingVertical: 6, alignItems: 'center' }}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text fontSize="$2" fontWeight="600" color="$color">Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, marginRight: 8, borderWidth: 1, borderColor: theme.borderColor.val, borderRadius: 8, paddingVertical: 6, alignItems: 'center' }}
          onPress={() => navigation.navigate('Analytics')}
        >
          <Text fontSize="$2" fontWeight="600" color="$color">Analytics</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, borderWidth: 1, borderColor: theme.borderColor.val, borderRadius: 8, paddingVertical: 6, alignItems: 'center' }}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text fontSize="$2" fontWeight="600" color="$color">Settings</Text>
        </TouchableOpacity>
      </XStack>
      <XStack marginTop="$md" borderBottomWidth={1} borderBottomColor="$borderColor">
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: tab === 'active' ? 2 : 0, borderBottomColor: theme.color.val }}
          onPress={() => setTab('active')}
        >
          <Text
            fontSize="$2"
            color={tab === 'active' ? '$color' : '$colorSecondary'}
            fontWeight={tab === 'active' ? '600' : '400'}
          >
            Active ({activeGoals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: tab === 'completed' ? 2 : 0, borderBottomColor: theme.color.val }}
          onPress={() => setTab('completed')}
        >
          <Text
            fontSize="$2"
            color={tab === 'completed' ? '$color' : '$colorSecondary'}
            fontWeight={tab === 'completed' ? '600' : '400'}
          >
            Completed ({completedGoals.length})
          </Text>
        </TouchableOpacity>
      </XStack>
    </YStack>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <YStack paddingHorizontal="$md">
          <GoalCard goal={item} onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })} />
        </YStack>
      )}
      ListEmptyComponent={
        <EmptyState title={tab === 'active' ? 'No active goals' : 'No completed goals'} />
      }
      ListFooterComponent={
        <XStack justifyContent="center" alignItems="center" paddingVertical="$lg">
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text fontSize="$1" color="$colorSecondary">Privacy Policy</Text>
          </TouchableOpacity>
          <Text fontSize="$1" color="$colorSecondary"> · </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text fontSize="$1" color="$colorSecondary">Terms & Conditions</Text>
          </TouchableOpacity>
        </XStack>
      }
      style={{ flex: 1, backgroundColor: theme.background.val }}
    />
  );
}
