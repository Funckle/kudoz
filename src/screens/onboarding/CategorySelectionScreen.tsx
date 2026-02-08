import React, { useState } from 'react';
import { TouchableOpacity, FlatList } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { getCategories } from '../../utils/categories';
import type { OnboardingScreenProps } from '../../types/navigation';
import type { Category } from '../../types/database';

export function CategorySelectionScreen({ navigation }: OnboardingScreenProps<'CategorySelection'>) {
  const theme = useTheme();
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
        style={{
          flex: 1,
          marginHorizontal: 4,
          padding: 16,
          borderRadius: 8,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? item.color : theme.borderColor.val,
          alignItems: 'center',
        }}
        onPress={() => toggleCategory(item.id)}
        activeOpacity={0.7}
      >
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          alignItems="center"
          justifyContent="center"
          marginBottom="$sm"
          backgroundColor={item.color + '20'}
        >
          <YStack
            width={20}
            height={20}
            borderRadius={10}
            backgroundColor={item.color}
          />
        </YStack>
        <Text fontSize="$2" fontWeight="600" color="$color">{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      <YStack flex={1} paddingHorizontal="$md" paddingTop="$xl">
        <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">
          What are you working on?
        </Text>
        <Text fontSize="$2" marginBottom="$lg" color="$colorSecondary">
          Select categories that interest you. You can always change this later.
        </Text>
        <FlatList
          data={getCategories()}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
        <Button
          title="Continue"
          onPress={() => navigation.navigate('SuggestedFollows')}
          disabled={selected.length === 0}
        />
      </YStack>
    </ScreenContainer>
  );
}
