import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { typography, spacing, borderRadius, borders } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
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
  const { colors } = useTheme();
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
        <View style={styles.container}>
          <Text style={[styles.title, { color: colors.text }]}>New Goal</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>What type of goal?</Text>
          {GOAL_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[styles.typeCard, { borderColor: colors.border }]}
              onPress={() => setGoalType(type.value)}
            >
              <Text style={[styles.typeLabel, { color: colors.text }]}>{type.label}</Text>
              <Text style={[styles.typeDesc, { color: colors.textSecondary }]}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer noTopInset>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => setGoalType(null)}>
          <Text style={[styles.changeType, { color: colors.textSecondary }]}>
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

        <Text style={[styles.sectionTitle, { color: categoryError ? colors.error : colors.text }]}>Categories (1-3){categoryError ? ' — select at least one' : ''}</Text>
        <View style={styles.categoryGrid}>
          {getCategories().map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, { borderColor: colors.border }, selectedCategories.includes(cat.id) && { borderColor: cat.color, backgroundColor: cat.color + '15' }]}
              onPress={() => toggleCategory(cat.id)}
            >
              <View style={[styles.catDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Visibility</Text>
        <View style={styles.visibilityRow}>
          {VISIBILITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.visChip, { borderColor: colors.border }, visibility === opt.value && { backgroundColor: colors.text, borderColor: colors.text }]}
              onPress={() => setVisibility(opt.value)}
            >
              <Text style={[styles.visText, { color: colors.text }, visibility === opt.value && { color: colors.background }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Create Goal" onPress={handleCreate} loading={creating} style={styles.createBtn} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.sm },
  subtitle: { ...typography.body, marginBottom: spacing.lg },
  typeCard: { padding: spacing.md, borderWidth: borders.width, borderRadius, marginBottom: spacing.sm },
  typeLabel: { ...typography.goalTitle },
  typeDesc: { ...typography.caption, marginTop: spacing.xs },
  changeType: { ...typography.caption, fontWeight: '600', marginBottom: spacing.md },
  sectionTitle: { ...typography.body, fontWeight: '600', marginBottom: spacing.sm, marginTop: spacing.sm },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs + 2, borderWidth: 1, borderRadius, marginRight: spacing.xs, marginBottom: spacing.xs },
  catDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.xs },
  catName: { ...typography.caption },
  visibilityRow: { flexDirection: 'row', marginBottom: spacing.lg },
  visChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderWidth: 1, borderRadius, marginRight: spacing.sm },
  visText: { ...typography.caption },
  createBtn: { marginTop: spacing.sm, marginBottom: spacing.xl },
});
