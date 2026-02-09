import React, { useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { GoalCard } from '../../components/GoalCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LIMITS } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { useRole } from '../../hooks/useRole';
import { getUserGoals } from '../../services/goals';
import { createPost } from '../../services/posts';
import { checkGoalCompletion } from '../../services/goals';
import { pickImage, optimizeImage, uploadImage } from '../../services/media';
import { checkRateLimit } from '../../utils/rateLimit';
import type { GoalWithCategories } from '../../types/database';
import type { CreateScreenProps } from '../../types/navigation';

export function CreatePostScreen({ route, navigation }: CreateScreenProps<'CreatePost'>) {
  const theme = useTheme();
  const { user } = useAuth();
  const { isSuspended } = useRole();
  const [goals, setGoals] = useState<GoalWithCategories[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithCategories | null>(null);
  const [content, setContent] = useState('');
  const [progressValue, setProgressValue] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useFocusEffect(useCallback(() => {
    if (user) {
      getUserGoals(user.id, 'active').then(({ goals: g }) => {
        setGoals(g);
        // Auto-select if goalId passed and no goal selected yet
        const goalId = route.params?.goalId;
        if (goalId && !selectedGoal) {
          const found = g.find((gl) => gl.id === goalId);
          if (found) setSelectedGoal(found);
        }
        setLoading(false);
      });
    }
  }, [user, route.params?.goalId]));

  const handlePickImage = async () => {
    const result = await pickImage();
    if (!result.cancelled && result.uri) {
      const optimized = await optimizeImage(result.uri);
      setImageUri(optimized.uri);
      setImageSize({ width: optimized.width, height: optimized.height });
    }
  };

  const handlePost = async () => {
    if (!user || !selectedGoal) return;

    const rateCheck = checkRateLimit('post');
    if (!rateCheck.allowed) {
      Alert.alert('Slow down', rateCheck.message);
      return;
    }

    setPosting(true);

    try {
      let mediaUrl: string | undefined;
      let mediaWidth: number | undefined;
      let mediaHeight: number | undefined;

      if (imageUri) {
        const upload = await uploadImage(imageUri, user.id, Date.now().toString());
        if (upload.error) {
          Alert.alert('Upload failed', upload.error);
          return;
        }
        mediaUrl = upload.url;
        mediaWidth = imageSize?.width;
        mediaHeight = imageSize?.height;
      }

      const pv = progressValue ? parseFloat(progressValue) : undefined;

      const result = await createPost({
        user_id: user.id,
        goal_id: selectedGoal.id,
        content: content.trim() || undefined,
        post_type: 'progress',
        progress_value: pv,
        media_url: mediaUrl,
        media_type: mediaUrl ? 'image' : undefined,
        media_width: mediaWidth,
        media_height: mediaHeight,
      });

      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }

      // Check auto-completion
      if (pv) {
        await checkGoalCompletion(selectedGoal.id, user.id);
      }

      // Dismiss the modal, then switch to the Feed tab
      const root = navigation.getParent();
      if (root) {
        root.goBack();
        root.navigate('Main', { screen: 'HomeTab', params: { screen: 'Feed' } });
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Something went wrong');
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (isSuspended) {
    return (
      <ScreenContainer noTopInset>
        <EmptyState
          title="Posting is disabled"
          message="Your account is currently suspended. You can browse but cannot create new posts."
        />
      </ScreenContainer>
    );
  }

  if (goals.length === 0) {
    return (
      <ScreenContainer noTopInset>
        <EmptyState
          title="Create a goal first"
          message="Every post is linked to a goal. Create your first goal to start posting."
          actionTitle="Create Goal"
          onAction={() => navigation.navigate('CreateGoal')}
        />
      </ScreenContainer>
    );
  }

  if (!selectedGoal) {
    return (
      <ScreenContainer noTopInset>
        <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text fontSize="$5" fontWeight="700" marginBottom="$md" color="$color">Select a goal</Text>
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onPress={() => setSelectedGoal(goal)} />
          ))}
          <Button
            title="Create new goal"
            onPress={() => navigation.navigate('CreateGoal')}
            variant="secondary"
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </ScreenContainer>
    );
  }

  const showProgressInput = selectedGoal.goal_type !== 'milestone';

  return (
    <ScreenContainer noTopInset>
      <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setSelectedGoal(null)}>
          <Text fontSize="$2" fontWeight="600" marginBottom="$md" color="$colorSecondary">Goal: {selectedGoal.title} (change)</Text>
        </TouchableOpacity>

        {showProgressInput && (
          <TextInput
            label={selectedGoal.goal_type === 'currency' ? 'Amount ($)' : 'Progress'}
            placeholder={selectedGoal.goal_type === 'currency' ? '0.00' : '0'}
            value={progressValue}
            onChangeText={setProgressValue}
            keyboardType="numeric"
          />
        )}

        <TextInput
          label="Update"
          placeholder="Share your progress..."
          value={content}
          onChangeText={setContent}
          maxLength={LIMITS.POST_CONTENT}
          multiline
        />

        {imageUri ? (
          <YStack marginBottom="$md" borderRadius={8} overflow="hidden">
            <Image source={{ uri: imageUri }} style={{ width: '100%', ...(imageSize && { aspectRatio: imageSize.width / imageSize.height }) }} resizeMode="cover" />
            <TouchableOpacity style={{ marginTop: 4, alignSelf: 'flex-end' }} onPress={() => { setImageUri(null); setImageSize(null); }}>
              <Text fontSize="$1" color="$error">Remove</Text>
            </TouchableOpacity>
          </YStack>
        ) : (
          <Button title="Add photo" onPress={handlePickImage} variant="secondary" style={{ marginBottom: 16 }} />
        )}

        <Button title="Post" onPress={handlePost} loading={posting} disabled={!content.trim() && !progressValue} />
      </ScrollView>
    </ScreenContainer>
  );
}
