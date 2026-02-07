import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput as RNTextInput, TouchableOpacity } from 'react-native';
import { UserSearchResult } from '../../components/UserSearchResult';
import { GoalSearchResult } from '../../components/GoalSearchResult';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, typography, spacing, borderRadius, borders } from '../../utils/theme';
import { CATEGORIES } from '../../utils/categories';
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
      style={styles.categoryCard}
      onPress={() => navigation.navigate('CategoryFeed', { categoryId: item.id, categoryName: item.name })}
    >
      <View style={[styles.catIcon, { backgroundColor: item.color + '20' }]}>
        <View style={[styles.catDot, { backgroundColor: item.color }]} />
      </View>
      <Text style={styles.catName}>{item.name}</Text>
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
        style={styles.postResult}
        onPress={() => navigation.navigate('PostDetail', { postId: item.result_id })}
      >
        <Text style={styles.postContent} numberOfLines={2}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <RNTextInput
        style={styles.searchInput}
        placeholder="Search users, goals, posts..."
        value={query}
        onChangeText={handleSearch}
        placeholderTextColor={colors.gray}
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
              <View style={styles.emptySearch}>
                <Text style={styles.emptyText}>No results found</Text>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          numColumns={2}
          columnWrapperStyle={styles.categoryRow}
          contentContainerStyle={styles.categoryGrid}
          ListHeaderComponent={<Text style={styles.browseTitle}>Browse categories</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  searchInput: {
    ...typography.body,
    margin: spacing.md,
    padding: spacing.sm + 2,
    borderWidth: borders.width,
    borderColor: borders.color,
    borderRadius,
    color: colors.black,
  },
  browseTitle: { ...typography.sectionHeader, color: colors.black, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  categoryGrid: { paddingHorizontal: spacing.md },
  categoryRow: { justifyContent: 'space-between', marginBottom: spacing.sm },
  categoryCard: { flex: 1, marginHorizontal: spacing.xs, padding: spacing.md, borderWidth: borders.width, borderColor: borders.color, borderRadius, alignItems: 'center' },
  catIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  catDot: { width: 16, height: 16, borderRadius: 8 },
  catName: { ...typography.body, fontWeight: '600', color: colors.black },
  postResult: { padding: spacing.md, borderBottomWidth: borders.width, borderBottomColor: borders.color },
  postContent: { ...typography.body, color: colors.black },
  emptySearch: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { ...typography.body, color: colors.gray },
});
