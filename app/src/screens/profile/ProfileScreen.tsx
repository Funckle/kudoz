import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { GoalCard } from '../../components/GoalCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { typography, spacing, borders } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getUserGoals } from '../../services/goals';
import { getFollowerCount, getFollowingCount } from '../../services/follows';
import type { GoalWithCategories } from '../../types/database';
import type { ProfileScreenProps } from '../../types/navigation';

export function ProfileScreen({ navigation }: ProfileScreenProps<'Profile'>) {
  const { colors } = useTheme();
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

  useEffect(() => { loadData(); }, [loadData]);

  if (!user) return <LoadingSpinner />;

  const goals = tab === 'active' ? activeGoals : completedGoals;

  const header = (
    <View style={styles.header}>
      <View style={styles.profileRow}>
        <Avatar uri={user.avatar_url} name={user.name} size={80} />
        <View style={styles.stats}>
          <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('FollowList', { userId: user.id, type: 'followers' })}>
            <Text style={[styles.statNum, { color: colors.text }]}>{followers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('FollowList', { userId: user.id, type: 'following' })}>
            <Text style={[styles.statNum, { color: colors.text }]}>{following}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
          </TouchableOpacity>
          <View style={styles.stat}>
            <Text style={[styles.statNum, { color: colors.text }]}>{completedGoals.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Achieved</Text>
          </View>
        </View>
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
      <Text style={[styles.username, { color: colors.textSecondary }]}>@{user.username}</Text>
      {user.bio ? <Text style={[styles.bio, { color: colors.text }]}>{user.bio}</Text> : null}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={[styles.editBtnText, { color: colors.text }]}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={() => navigation.navigate('Settings')}>
          <Text style={[styles.editBtnText, { color: colors.text }]}>Settings</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.tab, tab === 'active' && { borderBottomWidth: 2, borderBottomColor: colors.text }]} onPress={() => setTab('active')}>
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === 'active' && { fontWeight: '600', color: colors.text }]}>Active ({activeGoals.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'completed' && { borderBottomWidth: 2, borderBottomColor: colors.text }]} onPress={() => setTab('completed')}>
          <Text style={[styles.tabText, { color: colors.textSecondary }, tab === 'completed' && { fontWeight: '600', color: colors.text }]}>Completed ({completedGoals.length})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      data={goals}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View style={styles.goalContainer}>
          <GoalCard goal={item} onPress={() => navigation.navigate('GoalDetail', { goalId: item.id })} />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState title={tab === 'active' ? 'No active goals' : 'No completed goals'} />
      }
      style={[styles.list, { backgroundColor: colors.background }]}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  header: { padding: spacing.md },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  stats: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: spacing.md },
  stat: { alignItems: 'center' },
  statNum: { ...typography.goalTitle },
  statLabel: { ...typography.caption },
  name: { ...typography.sectionHeader, marginTop: spacing.sm },
  username: { ...typography.body },
  bio: { ...typography.body, marginTop: spacing.xs },
  actionRow: { flexDirection: 'row', marginTop: spacing.md },
  editBtn: { flex: 1, marginRight: spacing.sm, borderWidth: 1, borderRadius: 8, paddingVertical: spacing.xs + 2, alignItems: 'center' },
  editBtnText: { ...typography.body, fontWeight: '600' },
  tabs: { flexDirection: 'row', marginTop: spacing.md, borderBottomWidth: borders.width },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabText: { ...typography.body },
  goalContainer: { paddingHorizontal: spacing.md },
});
