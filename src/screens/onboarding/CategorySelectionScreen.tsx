import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { typography, spacing, borderRadius, borders } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { getCategories } from '../../utils/categories';
import type { OnboardingScreenProps } from '../../types/navigation';
import type { Category } from '../../types/database';

export function CategorySelectionScreen({ navigation }: OnboardingScreenProps<'CategorySelection'>) {
  const { colors } = useTheme();
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
        style={[styles.card, { borderColor: colors.border }, isSelected && { borderColor: item.color, borderWidth: 2 }]}
        onPress={() => toggleCategory(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
          <View style={[styles.iconDot, { backgroundColor: item.color }]} />
        </View>
        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>What are you working on?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select categories that interest you. You can always change this later.</Text>
        <FlatList
          data={getCategories()}
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
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
  },
});
