import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatCard } from '../../components/StatCard';
import { BarChart } from '../../components/BarChart';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { getGoalStats, getActiveGoalProgress, getFollowerGrowth, getMostKudosedPosts, getMostKudosedGoals, getMostKudosedComments, getGoalsByCategory, getCompletionRateOverTime } from '../../services/analytics';

export function AnalyticsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, completionRate: 0 });
  const [activeGoals, setActiveGoals] = useState<Array<{ id: string; title: string; progress: number }>>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [topPosts, setTopPosts] = useState<Array<{ id: string; content: string; kudos_count: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [topGoals, setTopGoals] = useState<Array<{ id: string; title: string; kudos_count: number }>>([]);
  const [topComments, setTopComments] = useState<Array<{ id: string; content: string; kudos_count: number }>>([]);
  const [completionTrend, setCompletionTrend] = useState<Array<{ month: string; rate: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getGoalStats(user.id),
      getActiveGoalProgress(user.id),
      getFollowerGrowth(user.id),
      getMostKudosedPosts(user.id),
      getMostKudosedGoals(user.id),
      getMostKudosedComments(user.id),
      getGoalsByCategory(user.id),
      getCompletionRateOverTime(user.id),
    ]).then(([s, g, f, p, tg, tc, cats, trend]) => {
      setStats(s);
      setActiveGoals(g);
      setFollowerCount(f.count);
      setTopPosts(p);
      setTopGoals(tg);
      setTopComments(tc);
      setCategoryData(cats);
      setCompletionTrend(trend);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text fontSize="$5" fontWeight="700" marginBottom="$md" color="$color">Your Stats</Text>

        <XStack flexWrap="wrap" marginBottom="$md">
          <StatCard label="Total Goals" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Rate" value={`${stats.completionRate}%`} />
        </XStack>

        <StatCard label="Followers" value={followerCount} />

        {categoryData.length > 0 && (
          <YStack marginTop="$md">
            <Text fontSize="$4" fontWeight="600" marginBottom="$sm" color="$color">Goals by Category</Text>
            <BarChart
              data={categoryData.map((c) => ({ label: c.name, value: c.count, color: c.color }))}
            />
          </YStack>
        )}

        {completionTrend.length > 0 && (
          <YStack marginTop="$md">
            <Text fontSize="$4" fontWeight="600" marginBottom="$sm" color="$color">Completion Rate</Text>
            <BarChart
              data={completionTrend.map((c) => ({ label: c.month.substring(5), value: c.rate, color: theme.color.val }))}
            />
          </YStack>
        )}

        {activeGoals.length > 0 && (
          <YStack marginTop="$md">
            <Text fontSize="$4" fontWeight="600" marginBottom="$sm" color="$color">Active Goals</Text>
            {activeGoals.map((g) => (
              <YStack key={g.id} marginBottom="$md">
                <Text fontSize="$2" fontWeight="600" marginBottom="$xs" color="$color" numberOfLines={1}>{g.title}</Text>
                <ProgressBar current={g.progress} target={100} height={6} />
                <Text fontSize="$1" marginTop="$xs" color="$colorSecondary">{g.progress}%</Text>
              </YStack>
            ))}
          </YStack>
        )}

        {topGoals.length > 0 && (
          <YStack marginTop="$md">
            <Text fontSize="$4" fontWeight="600" marginBottom="$sm" color="$color">Most Kudos'd Goals</Text>
            {topGoals.map((g) => (
              <XStack key={g.id} justifyContent="space-between" alignItems="center" paddingVertical="$sm" borderBottomWidth={1} borderBottomColor="$borderColor">
                <Text fontSize="$2" color="$color" flex={1} numberOfLines={1}>{g.title}</Text>
                <Text fontSize="$1" fontWeight="600" marginLeft="$sm" color="$color">{g.kudos_count} Kudos</Text>
              </XStack>
            ))}
          </YStack>
        )}

        {topPosts.length > 0 && (
          <YStack marginTop="$md">
            <Text fontSize="$4" fontWeight="600" marginBottom="$sm" color="$color">Most Kudos'd Posts</Text>
            {topPosts.map((p) => (
              <XStack key={p.id} justifyContent="space-between" alignItems="center" paddingVertical="$sm" borderBottomWidth={1} borderBottomColor="$borderColor">
                <Text fontSize="$2" color="$color" flex={1} numberOfLines={1}>{p.content || '(no text)'}</Text>
                <Text fontSize="$1" fontWeight="600" marginLeft="$sm" color="$color">{p.kudos_count} Kudos</Text>
              </XStack>
            ))}
          </YStack>
        )}

        {topComments.length > 0 && (
          <YStack marginTop="$md" marginBottom="$lg">
            <Text fontSize="$4" fontWeight="600" marginBottom="$sm" color="$color">Most Kudos'd Comments</Text>
            {topComments.map((c) => (
              <XStack key={c.id} justifyContent="space-between" alignItems="center" paddingVertical="$sm" borderBottomWidth={1} borderBottomColor="$borderColor">
                <Text fontSize="$2" color="$color" flex={1} numberOfLines={1}>{c.content}</Text>
                <Text fontSize="$1" fontWeight="600" marginLeft="$sm" color="$color">{c.kudos_count} Kudos</Text>
              </XStack>
            ))}
          </YStack>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
