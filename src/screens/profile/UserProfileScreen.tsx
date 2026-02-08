import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { Avatar } from '../../components/Avatar';
import { GoalCard } from '../../components/GoalCard';
import { FollowButton } from '../../components/FollowButton';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ReportModal } from '../../components/ReportModal';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../services/auth';
import { getUserGoals } from '../../services/goals';
import { getFollowerCount, getFollowingCount } from '../../services/follows';
import { blockUser, muteUser } from '../../services/social';
import type { User, GoalWithCategories } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function UserProfileScreen({ route, navigation }: HomeScreenProps<'UserProfile'>) {
  const theme = useTheme();
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [goals, setGoals] = useState<GoalWithCategories[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportVisible, setReportVisible] = useState(false);

  const loadData = useCallback(async () => {
    const [{ user: u }, goalsResult, fc, fic] = await Promise.all([
      getUserProfile(userId),
      getUserGoals(userId),
      getFollowerCount(userId),
      getFollowingCount(userId),
    ]);
    setProfileUser(u ?? null);
    setGoals(goalsResult.goals);
    setFollowers(fc);
    setFollowing(fic);
    setLoading(false);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleBlock = () => {
    if (!currentUser) return;
    Alert.alert('Block user?', 'They won\'t be able to see your content or interact with you.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Block', style: 'destructive', onPress: async () => {
        await blockUser(currentUser.id, userId);
        navigation.goBack();
      }},
    ]);
  };

  const handleMute = async () => {
    if (!currentUser) return;
    await muteUser(currentUser.id, userId);
    Alert.alert('User muted', 'Their posts will be hidden from your feed.');
  };

  if (loading) return <LoadingSpinner />;
  if (!profileUser) return <EmptyState title="User not found" />;

  const header = (
    <YStack padding="$md">
      <XStack alignItems="center">
        <Avatar uri={profileUser.avatar_url} name={profileUser.name} size={80} />
        <XStack flex={1} justifyContent="space-around" marginLeft="$md">
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('FollowList', { userId, type: 'followers' })}>
            <Text fontSize="$3" fontWeight="600" color="$color">{followers}</Text>
            <Text fontSize="$1" color="$colorSecondary">Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => navigation.navigate('FollowList', { userId, type: 'following' })}>
            <Text fontSize="$3" fontWeight="600" color="$color">{following}</Text>
            <Text fontSize="$1" color="$colorSecondary">Following</Text>
          </TouchableOpacity>
        </XStack>
      </XStack>
      <Text fontSize="$4" fontWeight="600" marginTop="$sm" color="$color">{profileUser.name}</Text>
      <Text fontSize="$2" color="$colorSecondary">@{profileUser.username}</Text>
      {profileUser.bio ? <Text fontSize="$2" color="$color" marginTop="$xs">{profileUser.bio}</Text> : null}
      {profileUser.website ? (
        <TouchableOpacity onPress={() => Linking.openURL(profileUser.website!.startsWith('http') ? profileUser.website! : `https://${profileUser.website}`)}>
          <Text fontSize="$2" color="$link" marginTop="$xs" numberOfLines={1}>{profileUser.website}</Text>
        </TouchableOpacity>
      ) : null}
      <XStack alignItems="center" marginTop="$md">
        <FollowButton userId={userId} />
        <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => {
          Alert.alert('Options', '', [
            { text: 'Mute', onPress: handleMute },
            { text: 'Block', onPress: handleBlock, style: 'destructive' },
            { text: 'Report', onPress: () => setReportVisible(true) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}>
          <Text fontSize={20} color="$colorSecondary">···</Text>
        </TouchableOpacity>
      </XStack>
      <Text fontSize="$4" fontWeight="600" marginTop="$lg" color="$color">Goals</Text>
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <YStack paddingHorizontal="$md">
            <GoalCard goal={item} onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })} />
          </YStack>
        )}
        ListEmptyComponent={<EmptyState title="No visible goals" />}
      />
      <ReportModal
        visible={reportVisible}
        contentType="user"
        contentId={userId}
        onClose={() => setReportVisible(false)}
      />
    </YStack>
  );
}
