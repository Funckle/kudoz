import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { LIMITS } from '../../utils/validation';
import { getCategories } from '../../utils/categories';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { createGoal, getActiveGoalCount } from '../../services/goals';
import type { GoalType, Visibility, Category } from '../../types/database';
import type { CreateScreenProps } from '../../types/navigation';

const GOAL_TYPES: { value: GoalType; label: string; description: string }[] = [
  { value: 'currency', label: 'Savings', description: 'Track money saved toward a target' },
  { value: 'count', label: 'Counter', description: 'Count progress toward a number' },
  { value: 'milestone', label: 'Milestone', description: 'A goal you achieve or not' },
];

const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'friends', label: 'Mutual followers' },
  { value: 'private', label: 'Private' },
];

export function CreateGoalScreen({ navigation }: CreateScreenProps<'CreateGoal'>) {
  const theme = useTheme();
  const { user } = useAuth();
  const { canCreateGoal } = useSubscription();
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakes, setStakes] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [effortLabel, setEffortLabel] = useState('');
  const [effortTarget, setEffortTarget] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<Visibility>(user?.default_visibility ?? 'public');
  const [creating, setCreating] = useState(false);
  const [categoryError, setCategoryError] = useState(false);

  const toggleCategory = (id: string) => {
    setCategoryError(false);
    setSelectedCategories((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length >= LIMITS.MAX_CATEGORIES_PER_GOAL) return prev;
      return [...prev, id];
    });
  };

  const handleCreate = async () => {
    if (!user || !goalType) return;

    // Check free tier limit
    const activeCount = await getActiveGoalCount(user.id);
    if (!canCreateGoal(activeCount)) {
      Alert.alert('Goal limit reached', 'Free accounts can have up to 3 active goals. Upgrade to create more!');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Title required');
      return;
    }
    if (selectedCategories.length === 0) {
      setCategoryError(true);
      return;
    }

    setCreating(true);
    const result = await createGoal({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      goal_type: goalType,
      target_value: targetValue ? parseFloat(targetValue) : undefined,
      stakes: stakes.trim() || undefined,
      effort_label: effortLabel.trim() || undefined,
      effort_target: effortTarget ? parseInt(effortTarget) : undefined,
      visibility,
      category_ids: selectedCategories,
    });
    setCreating(false);

    if (result.error) {
      Alert.alert('Error', result.error);
    } else if (result.goal) {
      navigation.navigate('CreatePost', { goalId: result.goal.id });
    } else {
      navigation.goBack();
    }
  };

  if (!goalType) {
    return (
      <ScreenContainer noTopInset>
        <YStack flex={1} padding="$md">
          <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">New Goal</Text>
          <Text fontSize="$2" marginBottom="$lg" color="$colorSecondary">What type of goal?</Text>
          {GOAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={{ borderColor: theme.borderColor.val, padding: 16, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}
              onPress={() => setGoalType(type.value)}
            >
              <Text fontSize="$3" fontWeight="600" color="$color">{type.label}</Text>
              <Text fontSize="$1" marginTop="$xs" color="$colorSecondary">{type.description}</Text>
            </TouchableOpacity>
          ))}
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noTopInset>
      <ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setGoalType(null)}>
          <Text fontSize="$1" fontWeight="600" marginBottom="$md" color="$colorSecondary">
            {GOAL_TYPES.find((t) => t.value === goalType)?.label} (change)
          </Text>
        </TouchableOpacity>

        <TextInput label="Title" value={title} onChangeText={setTitle} maxLength={LIMITS.GOAL_TITLE} placeholder="What's your goal?" />
        <TextInput label="Description" value={description} onChangeText={setDescription} maxLength={LIMITS.GOAL_DESCRIPTION} placeholder="Describe your goal..." multiline />

        {goalType !== 'milestone' && (
          <TextInput label="Target" value={targetValue} onChangeText={setTargetValue} keyboardType="numeric" placeholder={goalType === 'currency' ? '1000' : '100'} />
        )}

        {goalType === 'milestone' && (
          <>
            <TextInput label="Effort tracker label (optional)" value={effortLabel} onChangeText={setEffortLabel} placeholder="e.g. Hours practiced" />
            {effortLabel ? (
              <TextInput label="Effort target" value={effortTarget} onChangeText={setEffortTarget} keyboardType="numeric" placeholder="100" />
            ) : null}
          </>
        )}

        <TextInput label="Stakes (optional)" value={stakes} onChangeText={setStakes} maxLength={LIMITS.STAKES} placeholder="What happens if you succeed or fail?" multiline />

        <Text fontSize="$2" fontWeight="600" marginBottom="$sm" marginTop="$sm" color={categoryError ? '$error' : '$color'}>
          Categories (1-3){categoryError ? ' — select at least one' : ''}
        </Text>
        <XStack flexWrap="wrap" marginBottom="$md">
          {getCategories().map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderWidth: 1,
                borderRadius: 8,
                marginRight: 4,
                marginBottom: 4,
                borderColor: selectedCategories.includes(cat.id) ? cat.color : theme.borderColor.val,
                backgroundColor: selectedCategories.includes(cat.id) ? cat.color + '15' : undefined,
              }}
              onPress={() => toggleCategory(cat.id)}
            >
              <YStack width={8} height={8} borderRadius={4} marginRight={4} backgroundColor={cat.color} />
              <Text fontSize="$1" color="$color">{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </XStack>

        <Text fontSize="$2" fontWeight="600" marginBottom="$sm" marginTop="$sm" color="$color">Visibility</Text>
        <XStack marginBottom="$lg">
          {VISIBILITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                borderWidth: 1,
                borderRadius: 8,
                marginRight: 8,
                borderColor: visibility === opt.value ? theme.color.val : theme.borderColor.val,
                backgroundColor: visibility === opt.value ? theme.color.val : undefined,
              }}
              onPress={() => setVisibility(opt.value)}
            >
              <Text fontSize="$1" color={visibility === opt.value ? '$background' : '$color'}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </XStack>

        <Button title="Create Goal" onPress={handleCreate} loading={creating} style={{ marginTop: 8, marginBottom: 32 }} />
      </ScrollView>
    </ScreenContainer>
  );
}
