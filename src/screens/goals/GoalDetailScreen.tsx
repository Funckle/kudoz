import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoalProgressHeader } from '../../components/GoalProgressHeader';
import { CategoryBadge } from '../../components/CategoryBadge';
import { PostCard } from '../../components/PostCard';
import { ReportModal } from '../../components/ReportModal';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { getGoal, completeGoal, deleteGoal } from '../../services/goals';
import { getPostsByGoalWithAuthors } from '../../services/posts';
import type { GoalWithCategories, PostWithAuthor } from '../../types/database';
import type { HomeScreenProps } from '../../types/navigation';

export function GoalDetailScreen({ route, navigation }: HomeScreenProps<'GoalDetail'>) {
  const { goalId } = route.params;
  const { user } = useAuth();
  const theme = useTheme();
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
        <YStack padding="$md">
          <Text fontSize="$5" fontWeight="700" color="$color">{goal.title}</Text>
          {goal.description ? <Text fontSize="$2" marginTop="$sm" color="$colorSecondary">{goal.description}</Text> : null}
          <XStack flexWrap="wrap" marginTop="$sm">
            {goal.categories.map((c) => <CategoryBadge key={c.id} category={c} />)}
          </XStack>
          <GoalProgressHeader goal={goal} />
          {goal.stakes && (
            <YStack marginTop="$md" padding="$md" borderRadius={8} backgroundColor="$borderColorLight">
              <Text fontSize="$1" fontWeight="600" marginBottom="$xs" color="$colorSecondary">Stakes</Text>
              <Text fontSize="$2" color="$color">{goal.stakes}</Text>
            </YStack>
          )}
          {isOwner && goal.status === 'active' && goal.goal_type === 'milestone' && goal.effort_target && goal.current_value >= goal.effort_target && (
            <YStack marginTop="$md" padding="$md" borderRadius={8} borderWidth={1} alignItems="center" backgroundColor="$borderColorLight" borderColor="$borderColor">
              <Text fontSize="$4" fontWeight="600" marginBottom="$xs" color="$color">You've hit your target!</Text>
              <Text fontSize="$2" marginBottom="$sm" color="$colorSecondary">Ready to mark this goal complete?</Text>
              <Button title="Complete Goal" onPress={handleComplete} style={{ minWidth: 160 }} />
            </YStack>
          )}
          {showInvitePrompt && user && user.invites_remaining > 0 && (
            <YStack marginTop="$md" padding="$md" borderRadius={8} borderWidth={1} alignItems="center" backgroundColor="$borderColorLight" borderColor="$borderColor">
              <Text fontSize="$4" fontWeight="600" marginBottom="$xs" color="$color">Know someone who'd benefit?</Text>
              <Text fontSize="$2" marginBottom="$sm" color="$colorSecondary">You have {user.invites_remaining} invite{user.invites_remaining !== 1 ? 's' : ''} left.</Text>
              <XStack marginTop="$md">
                <Button title="Share Invite" onPress={() => { setShowInvitePrompt(false); navigation.navigate('Invites' as any); }} style={{ flex: 1, marginRight: 8 }} />
                <Button title="Not now" onPress={() => setShowInvitePrompt(false)} variant="secondary" style={{ flex: 1, marginRight: 8 }} />
              </XStack>
            </YStack>
          )}
          {isOwner && goal.status === 'active' && (
            <XStack marginTop="$md">
              <Button title="Complete" onPress={handleComplete} style={{ flex: 1, marginRight: 8 }} />
              <Button title="Edit" onPress={() => navigation.navigate('GoalDetail', { goalId })} variant="secondary" style={{ flex: 1, marginRight: 8 }} />
              <Button title="Delete" onPress={handleDelete} variant="destructive" style={{ flex: 1, marginRight: 8 }} />
            </XStack>
          )}
          <Text fontSize="$4" fontWeight="600" marginTop="$lg" marginBottom="$sm" color="$color">Updates</Text>
        </YStack>
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
      style={{ flex: 1, backgroundColor: theme.background.val }}
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
