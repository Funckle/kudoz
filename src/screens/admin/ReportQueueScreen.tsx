import React, { useState, useCallback } from 'react';
import { FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { XStack, YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useFocusEffect } from '@react-navigation/native';
import { getPendingReports } from '../../services/admin';
import { formatTimeAgo } from '../../utils/format';
import type { ReportWithDetails } from '../../types/database';
import type { ProfileScreenProps } from '../../types/navigation';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: 'Post',
  comment: 'Comment',
  user: 'User',
  goal: 'Goal',
};

export function ReportQueueScreen({ navigation }: ProfileScreenProps<'ReportQueue'>) {
  const theme = useTheme();
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    const result = await getPendingReports();
    setReports(result.reports);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.borderColor.val,
            }}
            onPress={() => navigation.navigate('ReportDetail', { reportId: item.id })}
          >
            <XStack justifyContent="space-between" alignItems="center" marginBottom={4}>
              <XStack alignItems="center" gap="$xs">
                <YStack
                  backgroundColor="$borderColorLight"
                  borderRadius={4}
                  paddingHorizontal={6}
                  paddingVertical={2}
                >
                  <Text fontSize={11} fontWeight="600" color="$colorSecondary">
                    {CONTENT_TYPE_LABELS[item.content_type] || item.content_type}
                  </Text>
                </YStack>
                <Text fontSize="$1" color="$colorSecondary">{item.reason}</Text>
              </XStack>
              <Text fontSize={11} color="$colorSecondary">{formatTimeAgo(item.created_at)}</Text>
            </XStack>
            <Text fontSize="$2" color="$color" numberOfLines={2}>
              {item.reporter ? `Reported by @${item.reporter.username}` : 'Report'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState title="No pending reports" message="All caught up!" />}
        style={{ flex: 1 }}
      />
    </ScreenContainer>
  );
}
