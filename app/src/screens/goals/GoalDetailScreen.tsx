import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { GoalProgressHeader } from '../../components/GoalProgressHeader';
import { CategoryBadge } from '../../components/CategoryBadge';
import { PostCard } from '../../components/PostCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { colors, typography, spacing, borders } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { getGoal, completeGoal, deleteGoal } from '../../services/goals';
import { getPostsByGoal } from '../../services/posts';
import type { GoalWithCategories, Post } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function GoalDetailScreen({ route, navigation }: HomeScreenProps<'GoalDetail'>) {
  const { goalId } = route.params;
  const { user } = useAuth();
  const [goal, setGoal] = useState<GoalWithCategories | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    const [goalResult, postsResult] = await Promise.all([
      getGoal(goalId),
      getPostsByGoal(goalId),
    ]);
    if (goalResult.error) setError(goalResult.error);
    if (goalResult.goal) setGoal(goalResult.goal);
    if (postsResult.posts) setPosts(postsResult.posts);
    setLoading(false);
  }, [goalId]);

  useEffect(() => { loadData(); }, [loadData]);

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
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>{goal.title}</Text>
          {goal.description ? <Text style={styles.description}>{goal.description}</Text> : null}
          <View style={styles.categories}>
            {goal.categories.map((c) => <CategoryBadge key={c.id} category={c} />)}
          </View>
          <GoalProgressHeader goal={goal} />
          {goal.stakes && (
            <View style={styles.stakesBox}>
              <Text style={styles.stakesLabel}>Stakes</Text>
              <Text style={styles.stakesText}>{goal.stakes}</Text>
            </View>
          )}
          {isOwner && goal.status === 'active' && (
            <View style={styles.ownerActions}>
              <Button title="Complete" onPress={handleComplete} style={styles.actionBtn} />
              <Button title="Edit" onPress={() => navigation.navigate('GoalDetail', { goalId })} variant="secondary" style={styles.actionBtn} />
              <Button title="Delete" onPress={handleDelete} variant="destructive" style={styles.actionBtn} />
            </View>
          )}
          <Text style={styles.postsTitle}>Updates</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.postItem}>
          <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
          {item.content && <Text style={styles.postContent}>{item.content}</Text>}
          {item.progress_value != null && (
            <Text style={styles.postProgress}>
              +{goal.goal_type === 'currency' ? `$${item.progress_value}` : item.progress_value}
            </Text>
          )}
        </View>
      )}
      ListEmptyComponent={<EmptyState title="No updates yet" />}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.md },
  title: { ...typography.title, color: colors.black },
  description: { ...typography.body, color: colors.gray, marginTop: spacing.sm },
  categories: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  stakesBox: { marginTop: spacing.md, padding: spacing.md, backgroundColor: colors.grayLighter, borderRadius: 8 },
  stakesLabel: { ...typography.caption, fontWeight: '600', color: colors.gray, marginBottom: spacing.xs },
  stakesText: { ...typography.body, color: colors.black },
  ownerActions: { flexDirection: 'row', marginTop: spacing.md },
  actionBtn: { flex: 1, marginRight: spacing.sm },
  postsTitle: { ...typography.sectionHeader, color: colors.black, marginTop: spacing.lg, marginBottom: spacing.sm },
  postItem: { padding: spacing.md, borderBottomWidth: borders.width, borderBottomColor: borders.color },
  postDate: { ...typography.caption, color: colors.gray },
  postContent: { ...typography.body, color: colors.black, marginTop: spacing.xs },
  postProgress: { ...typography.body, fontWeight: '600', color: colors.black, marginTop: spacing.xs },
});
