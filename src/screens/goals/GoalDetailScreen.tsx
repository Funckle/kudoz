import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoalProgressHeader } from '../../components/GoalProgressHeader';
import { CategoryBadge } from '../../components/CategoryBadge';
import { PostCard } from '../../components/PostCard';
import { ReportModal } from '../../components/ReportModal';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getGoal, completeGoal, deleteGoal } from '../../services/goals';
import { getPostsByGoalWithAuthors } from '../../services/posts';
import type { GoalWithCategories, PostWithAuthor } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function GoalDetailScreen({ route, navigation }: HomeScreenProps<'GoalDetail'>) {
  const { goalId } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const [goal, setGoal] = useState<GoalWithCategories | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportTarget, setReportTarget] = useState<{ visible: boolean; postId: string }>({ visible: false, postId: '' });
  const [showInvitePrompt, setShowInvitePrompt] = useState(false);

  const loadData = useCallback(async () => {
    const [goalResult, postsResult] = await Promise.all([
      getGoal(goalId),
      getPostsByGoalWithAuthors(goalId),
    ]);
    if (goalResult.error) setError(goalResult.error);
    if (goalResult.goal) setGoal(goalResult.goal);
    if (postsResult.posts) setPosts(postsResult.posts);
    setLoading(false);
  }, [goalId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const isOwner = user?.id === goal?.user_id;

  const handleComplete = () => {
    if (!goal || !user) return;
    Alert.alert('Mark as completed?', 'This will create a completion post.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          await completeGoal(goal.id, user.id);
          loadData();
          // Show invite prompt if user has invites
          if (user.invites_remaining > 0) {
            const promptKey = `invite_prompt_${goal.id}`;
            const alreadyShown = await AsyncStorage.getItem(promptKey);
            if (!alreadyShown) {
              await AsyncStorage.setItem(promptKey, 'true');
              setShowInvitePrompt(true);
            }
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (!goal) return;
    Alert.alert('Delete goal?', 'All linked posts will also be deleted. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGoal(goal.id);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;
  if (error || !goal) return <ErrorState message={error} onRetry={loadData} />;

  return (
    <>
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{goal.title}</Text>
          {goal.description ? <Text style={[styles.description, { color: colors.textSecondary }]}>{goal.description}</Text> : null}
          <View style={styles.categories}>
            {goal.categories.map((c) => <CategoryBadge key={c.id} category={c} />)}
          </View>
          <GoalProgressHeader goal={goal} />
          {goal.stakes && (
            <View style={[styles.stakesBox, { backgroundColor: colors.borderLight }]}>
              <Text style={[styles.stakesLabel, { color: colors.textSecondary }]}>Stakes</Text>
              <Text style={[styles.stakesText, { color: colors.text }]}>{goal.stakes}</Text>
            </View>
          )}
          {isOwner && goal.status === 'active' && goal.goal_type === 'milestone' && goal.effort_target && goal.current_value >= goal.effort_target && (
            <View style={[styles.milestonePrompt, { backgroundColor: colors.borderLight, borderColor: colors.border }]}>
              <Text style={[styles.milestoneTitle, { color: colors.text }]}>You've hit your target!</Text>
              <Text style={[styles.milestoneBody, { color: colors.textSecondary }]}>Ready to mark this goal complete?</Text>
              <Button title="Complete Goal" onPress={handleComplete} style={styles.milestoneBtn} />
            </View>
          )}
          {showInvitePrompt && user && user.invites_remaining > 0 && (
            <View style={[styles.milestonePrompt, { backgroundColor: colors.borderLight, borderColor: colors.border }]}>
              <Text style={[styles.milestoneTitle, { color: colors.text }]}>Know someone who'd benefit?</Text>
              <Text style={[styles.milestoneBody, { color: colors.textSecondary }]}>You have {user.invites_remaining} invite{user.invites_remaining !== 1 ? 's' : ''} left.</Text>
              <View style={styles.ownerActions}>
                <Button title="Share Invite" onPress={() => { setShowInvitePrompt(false); navigation.navigate('Invites' as any); }} style={styles.actionBtn} />
                <Button title="Not now" onPress={() => setShowInvitePrompt(false)} variant="secondary" style={styles.actionBtn} />
              </View>
            </View>
          )}
          {isOwner && goal.status === 'active' && (
            <View style={styles.ownerActions}>
              <Button title="Complete" onPress={handleComplete} style={styles.actionBtn} />
              <Button title="Edit" onPress={() => navigation.navigate('GoalDetail', { goalId })} variant="secondary" style={styles.actionBtn} />
              <Button title="Delete" onPress={handleDelete} variant="destructive" style={styles.actionBtn} />
            </View>
          )}
          <Text style={[styles.postsTitle, { color: colors.text }]}>Updates</Text>
        </View>
      }
      renderItem={({ item }) => (
        <PostCard
          post={item}
          onPressAuthor={() => navigation.navigate('UserProfile', { userId: item.user_id })}
          onPressGoal={() => {}}
          onPressPost={() => navigation.navigate('PostDetail', { postId: item.id })}
          onPressComments={() => navigation.navigate('PostDetail', { postId: item.id })}
          onEdit={() => navigation.getParent()?.navigate('CreateModal', { screen: 'EditPost', params: { postId: item.id } })}
          onReport={() => setReportTarget({ visible: true, postId: item.id })}
          onDeleted={loadData}
        />
      )}
      ListEmptyComponent={<EmptyState title="No updates yet" />}
      style={[styles.container, { backgroundColor: colors.background }]}
    />
    <ReportModal
      visible={reportTarget.visible}
      contentType="post"
      contentId={reportTarget.postId}
      onClose={() => setReportTarget({ visible: false, postId: '' })}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.md },
  title: { ...typography.title },
  description: { ...typography.body, marginTop: spacing.sm },
  categories: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  stakesBox: { marginTop: spacing.md, padding: spacing.md, borderRadius: 8 },
  stakesLabel: { ...typography.caption, fontWeight: '600', marginBottom: spacing.xs },
  stakesText: { ...typography.body },
  milestonePrompt: { marginTop: spacing.md, padding: spacing.md, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  milestoneTitle: { ...typography.sectionHeader, marginBottom: spacing.xs },
  milestoneBody: { ...typography.body, marginBottom: spacing.sm },
  milestoneBtn: { minWidth: 160 },
  ownerActions: { flexDirection: 'row', marginTop: spacing.md },
  actionBtn: { flex: 1, marginRight: spacing.sm },
  postsTitle: { ...typography.sectionHeader, marginTop: spacing.lg, marginBottom: spacing.sm },
});
