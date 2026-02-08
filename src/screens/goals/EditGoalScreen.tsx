import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { YStack } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { LIMITS } from '../../utils/validation';
import { getGoal, updateGoal, deleteGoal } from '../../services/goals';
import type { CreateScreenProps } from '../../types/navigation';

export function EditGoalScreen({ route, navigation }: CreateScreenProps<'EditGoal'>) {
  const { goalId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakes, setStakes] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getGoal(goalId).then(({ goal }) => {
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description);
        setStakes(goal.stakes || '');
        setTargetValue(goal.target_value?.toString() || '');
      }
      setLoading(false);
    });
  }, [goalId]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateGoal(goalId, {
      title: title.trim(),
      description: description.trim(),
      stakes: stakes.trim() || undefined,
      target_value: targetValue ? parseFloat(targetValue) : undefined,
    });
    setSaving(false);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else {
      navigation.goBack();
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete goal?', 'All linked posts will also be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteGoal(goalId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
        <TextInput label="Title" value={title} onChangeText={setTitle} maxLength={LIMITS.GOAL_TITLE} />
        <TextInput label="Description" value={description} onChangeText={setDescription} maxLength={LIMITS.GOAL_DESCRIPTION} multiline />
        <TextInput label="Target" value={targetValue} onChangeText={setTargetValue} keyboardType="numeric" />
        <TextInput label="Stakes" value={stakes} onChangeText={setStakes} maxLength={LIMITS.STAKES} multiline />
        <YStack gap="$md" marginTop="$sm">
          <Button title="Save" onPress={handleSave} loading={saving} />
          <Button title="Delete Goal" onPress={handleDelete} variant="destructive" />
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
