import React, { useState, useCallback, useRef } from 'react';
import { FlatList, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { UserSearchResult } from '../../components/UserSearchResult';
import { GoalSearchResult } from '../../components/GoalSearchResult';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getCategories } from '../../utils/categories';
import { useAuth } from '../../hooks/useAuth';
import { searchAll } from '../../services/search';
import type { Category } from '../../types/database';
import type { SearchScreenProps } from '../../types/navigation';

interface SearchResult {
  result_type: 'user' | 'goal' | 'post';
  result_id: string;
  title: string;
  subtitle: string | null;
  avatar_url: string | null;
}

export function SearchScreen({ navigation }: SearchScreenProps<'Search'>) {
  const theme = useTheme();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounce.current) clearTimeout(debounce.current);
    if (!text.trim()) {
      setResults([]);
      return;
    }
    debounce.current = setTimeout(async () => {
      if (!user) return;
      setSearching(true);
      const { results: r } = await searchAll(text, user.id);
      setResults(r);
      setSearching(false);
    }, 300);
  }, [user]);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        marginHorizontal: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.borderColor.val,
        borderRadius: 8,
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('CategoryFeed', { categoryId: item.id, categoryName: item.name })}
    >
      <YStack
        width={40}
        height={40}
        borderRadius={20}
        alignItems="center"
        justifyContent="center"
        marginBottom="$xs"
        backgroundColor={item.color + '20'}
      >
        <YStack width={16} height={16} borderRadius={8} backgroundColor={item.color} />
      </YStack>
      <Text fontSize="$2" fontWeight="600" color="$color">{item.name}</Text>
    </TouchableOpacity>
  );

  const renderResult = ({ item }: { item: SearchResult }) => {
    if (item.result_type === 'user') {
      return (
        <UserSearchResult
          id={item.result_id}
          name={item.title}
          username={item.subtitle}
          avatarUrl={item.avatar_url}
          onPress={() => navigation.navigate('UserProfile', { userId: item.result_id })}
        />
      );
    }
    if (item.result_type === 'goal') {
      return (
        <GoalSearchResult
          title={item.title}
          description={item.subtitle}
          onPress={() => navigation.navigate('GoalDetail', { goalId: item.result_id })}
        />
      );
    }
    return (
      <TouchableOpacity
        style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: theme.borderColor.val }}
        onPress={() => navigation.navigate('PostDetail', { postId: item.result_id })}
      >
        <Text fontSize="$2" color="$color" numberOfLines={2}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <RNTextInput
        style={{
          fontSize: 14,
          fontWeight: '400',
          margin: 16,
          padding: 10,
          borderWidth: 1,
          borderRadius: 8,
          color: theme.color.val,
          borderColor: theme.borderColor.val,
        }}
        placeholder="Search users, goals, posts..."
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor={theme.colorSecondary.val}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {query.trim() ? (
        searching ? (
          <LoadingSpinner size="small" />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => `${item.result_type}-${item.result_id}`}
            renderItem={renderResult}
            ListEmptyComponent={
              <YStack padding="$xl" alignItems="center">
                <Text fontSize="$2" color="$colorSecondary">No results found</Text>
              </YStack>
            }
          />
        )
      ) : (
        <FlatList
          data={getCategories()}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 8 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListHeaderComponent={<Text fontSize="$4" fontWeight="600" color="$color" paddingHorizontal="$md" marginBottom="$sm">Browse categories</Text>}
        />
      )}
    </YStack>
  );
}
