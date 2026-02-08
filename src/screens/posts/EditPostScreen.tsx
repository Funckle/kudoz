import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { Text } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LIMITS } from '../../utils/validation';
import { getPost, updatePost } from '../../services/posts';
import type { CreateScreenProps } from '../../types/navigation';

export function EditPostScreen({ route, navigation }: CreateScreenProps<'EditPost'>) {
  const { postId } = route.params;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progressValue, setProgressValue] = useState<number | null>(null);

  useEffect(() => {
    getPost(postId).then(({ post }) => {
      if (post) {
        setContent(post.content || '');
        setProgressValue(post.progress_value ?? null);
      }
      setLoading(false);
    });
  }, [postId]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updatePost(postId, { content: content.trim() });
    setSaving(false);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      navigation.goBack();
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
        {progressValue != null && (
          <Text fontSize="$1" marginBottom="$md" color="$colorSecondary">Progress value: {progressValue} (not editable)</Text>
        )}
        <TextInput
          label="Update"
          value={content}
          onChangeText={setContent}
          maxLength={LIMITS.POST_CONTENT}
          multiline
        />
        <Button title="Save" onPress={handleSave} loading={saving} />
      </ScrollView>
    </ScreenContainer>
  );
}
