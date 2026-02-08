import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { GoalCard } from '../../components/GoalCard';
import { FollowButton } from '../../components/FollowButton';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ReportModal } from '../../components/ReportModal';
import { typography, spacing, borders } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../services/auth';
import { getUserGoals } from '../../services/goals';
import { getFollowerCount, getFollowingCount } from '../../services/follows';
import { blockUser, muteUser } from '../../services/social';
import type { User, GoalWithCategories } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function UserProfileScreen({ route, navigation }: HomeScreenProps<'UserProfile'>) {
  const { colors } = useTheme();
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
    <View style={styles.header}>
      <View style={styles.profileRow}>
        <Avatar uri={profileUser.avatar_url} name={profileUser.name} size={80} />
        <View style={styles.stats}>
          <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('FollowList', { userId, type: 'followers' })}>
            <Text style={[styles.statNum, { color: colors.text }]}>{followers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('FollowList', { userId, type: 'following' })}>
            <Text style={[styles.statNum, { color: colors.text }]}>{following}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{profileUser.name}</Text>
      <Text style={[styles.username, { color: colors.textSecondary }]}>@{profileUser.username}</Text>
      {profileUser.bio ? <Text style={[styles.bio, { color: colors.text }]}>{profileUser.bio}</Text> : null}
      {profileUser.website ? (
        <TouchableOpacity onPress={() => Linking.openURL(profileUser.website!.startsWith('http') ? profileUser.website! : `https://${profileUser.website}`)}>
          <Text style={[styles.website, { color: colors.link }]} numberOfLines={1}>{profileUser.website}</Text>
        </TouchableOpacity>
      ) : null}
      <View style={styles.actionRow}>
        <FollowButton userId={userId} />
        <TouchableOpacity style={styles.menuBtn} onPress={() => {
          Alert.alert('Options', '', [
            { text: 'Mute', onPress: handleMute },
            { text: 'Block', onPress: handleBlock, style: 'destructive' },
            { text: 'Report', onPress: () => setReportVisible(true) },
            { text: 'Cancel', style: 'cancel' },
          ]);
        }}>
          <Text style={[styles.menuText, { color: colors.textSecondary }]}>···</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.goalsTitle, { color: colors.text }]}>Goals</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={styles.goalContainer}>
            <GoalCard goal={item} onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })} />
          </View>
        )}
        ListEmptyComponent={<EmptyState title="No visible goals" />}
      />
      <ReportModal
        visible={reportVisible}
        contentType="user"
        contentId={userId}
        onClose={() => setReportVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: spacing.md },
  stat: { alignItems: 'center' },
  statNum: { ...typography.goalTitle },
  statLabel: { ...typography.caption },
  name: { ...typography.sectionHeader, marginTop: spacing.sm },
  username: { ...typography.body },
  bio: { ...typography.body, marginTop: spacing.xs },
  website: { ...typography.body, marginTop: spacing.xs },
  actionRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  menuBtn: { marginLeft: spacing.md },
  menuText: { fontSize: 20 },
  goalsTitle: { ...typography.sectionHeader, marginTop: spacing.lg },
  goalContainer: { paddingHorizontal: spacing.md },
});
