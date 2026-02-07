import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { colors, typography, spacing, borderRadius, borders } from '../../utils/theme';
import { CATEGORIES } from '../../utils/categories';
import type { OnboardingScreenProps } from '../../types/navigation';
import type { Category } from '../../types/database';

export function CategorySelectionScreen({ navigation }: OnboardingScreenProps<'CategorySelection'>) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const isSelected = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && { borderColor: item.color, borderWidth: 2 }]}
        onPress={() => toggleCategory(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
          <View style={[styles.iconDot, { backgroundColor: item.color }]} />
        </View>
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>What are you working on?</Text>
        <Text style={styles.subtitle}>Select categories that interest you. You can always change this later.</Text>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
        />
        <Button
          title="Continue"
          onPress={() => navigation.navigate('SuggestedFollows')}
          disabled={selected.length === 0}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  grid: {
    paddingBottom: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  card: {
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.md,
    borderRadius,
    borderWidth: borders.width,
    borderColor: borders.color,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  categoryName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.black,
  },
});
