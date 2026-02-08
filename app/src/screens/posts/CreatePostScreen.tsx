import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { GoalCard } from '../../components/GoalCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { typography, spacing, borderRadius, borders } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { LIMITS } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';
import { getUserGoals } from '../../services/goals';
import { createPost } from '../../services/posts';
import { checkGoalCompletion } from '../../services/goals';
import { pickImage, optimizeImage, uploadImage } from '../../services/media';
import { checkRateLimit } from '../../utils/rateLimit';
import type { GoalWithCategories } from '../../types/database';
import type { CreateScreenProps } from '../../types/navigation';

export function CreatePostScreen({ route, navigation }: CreateScreenProps<'CreatePost'>) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalWithCategories[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<GoalWithCategories | null>(null);
  const [content, setContent] = useState('');
  const [progressValue, setProgressValue] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (user) {
      getUserGoals(user.id, 'active').then(({ goals: g }) => {
        setGoals(g);
        // Pre-select if goalId passed
        const goalId = route.params?.goalId;
        if (goalId) {
          const found = g.find((gl) => gl.id === goalId);
          if (found) setSelectedGoal(found);
        }
        setLoading(false);
      });
    }
  }, [user, route.params]);

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

    let mediaUrl: string | undefined;
    let mediaWidth: number | undefined;
    let mediaHeight: number | undefined;

    if (imageUri) {
      const upload = await uploadImage(imageUri, user.id, Date.now().toString());
      if (upload.error) {
        Alert.alert('Upload failed', upload.error);
        setPosting(false);
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
      setPosting(false);
      return;
    }

    // Check auto-completion
    if (pv) {
      await checkGoalCompletion(selectedGoal.id, user.id);
    }

    setPosting(false);
    navigation.goBack();
  };

  if (loading) return <LoadingSpinner />;

  if (goals.length === 0) {
    return (
      <ScreenContainer>
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
      <ScreenContainer>
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>Select a goal</Text>
          <ScrollView>
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onPress={() => setSelectedGoal(goal)} />
            ))}
          </ScrollView>
          <Button
            title="Create new goal"
            onPress={() => navigation.navigate('CreateGoal')}
            variant="secondary"
            style={styles.newGoalBtn}
          />
        </View>
      </ScreenContainer>
    );
  }

  const showProgressInput = selectedGoal.goal_type !== 'milestone';

  return (
    <ScreenContainer>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setSelectedGoal(null)}>
          <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Goal: {selectedGoal.title} (change)</Text>
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
          filterBadWords
        />

        {imageUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity style={styles.removeImage} onPress={() => { setImageUri(null); setImageSize(null); }}>
              <Text style={[styles.removeImageText, { color: colors.error }]}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button title="Add photo" onPress={handlePickImage} variant="secondary" style={styles.photoBtn} />
        )}

        <Button title="Post" onPress={handlePost} loading={posting} disabled={!content.trim() && !progressValue} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.md,
  },
  goalLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  imagePreview: {
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius,
  },
  removeImage: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  removeImageText: {
    ...typography.caption,
  },
  photoBtn: {
    marginBottom: spacing.md,
  },
  newGoalBtn: {
    marginTop: spacing.sm,
  },
});
