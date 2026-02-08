import React, { useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboardStats } from '../../services/admin';
import type { ProfileScreenProps } from '../../types/navigation';

export function AdminDashboardScreen({ navigation }: ProfileScreenProps<'AdminDashboard'>) {
  const theme = useTheme();
  const [pendingReports, setPendingReports] = useState(0);
  const [activeSuspensions, setActiveSuspensions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const stats = await getDashboardStats();
    setPendingReports(stats.pendingReports);
    setActiveSuspensions(stats.activeSuspensions);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text fontSize="$5" fontWeight="700" marginBottom="$lg" color="$color">Moderation</Text>

        <XStack gap="$md" marginBottom="$lg">
          <YStack
            flex={1}
            padding="$md"
            borderRadius={12}
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$surface"
            alignItems="center"
          >
            <Text fontSize={28} fontWeight="700" color="$color">{pendingReports}</Text>
            <Text fontSize="$1" color="$colorSecondary">Pending Reports</Text>
          </YStack>
          <YStack
            flex={1}
            padding="$md"
            borderRadius={12}
            borderWidth={1}
            borderColor="$borderColor"
            backgroundColor="$surface"
            alignItems="center"
          >
            <Text fontSize={28} fontWeight="700" color="$color">{activeSuspensions}</Text>
            <Text fontSize="$1" color="$colorSecondary">Active Suspensions</Text>
          </YStack>
        </XStack>

        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginBottom="$sm" textTransform="uppercase">Actions</Text>

        <TouchableOpacity
          style={{
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: theme.borderColor.val,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('ReportQueue')}
        >
          <Text fontSize="$2" color="$color">Report Queue</Text>
          {pendingReports > 0 && (
            <XStack
              backgroundColor="$error"
              borderRadius={10}
              paddingHorizontal={8}
              paddingVertical={2}
            >
              <Text fontSize="$1" fontWeight="600" color="white">{pendingReports}</Text>
            </XStack>
          )}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
