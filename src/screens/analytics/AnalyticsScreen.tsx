import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatCard } from '../../components/StatCard';
import { BarChart } from '../../components/BarChart';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getGoalStats, getActiveGoalProgress, getFollowerGrowth, getMostKudozdPosts, getMostKudozdGoals, getMostKudozdComments, getGoalsByCategory, getCompletionRateOverTime } from '../../services/analytics';

export function AnalyticsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, completionRate: 0 });
  const [activeGoals, setActiveGoals] = useState<Array<{ id: string; title: string; progress: number }>>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [topPosts, setTopPosts] = useState<Array<{ id: string; content: string; kudoz_count: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; count: number; color: string }>>([]);
  const [topGoals, setTopGoals] = useState<Array<{ id: string; title: string; kudoz_count: number }>>([]);
  const [topComments, setTopComments] = useState<Array<{ id: string; content: string; kudoz_count: number }>>([]);
  const [completionTrend, setCompletionTrend] = useState<Array<{ month: string; rate: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getGoalStats(user.id),
      getActiveGoalProgress(user.id),
      getFollowerGrowth(user.id),
      getMostKudozdPosts(user.id),
      getMostKudozdGoals(user.id),
      getMostKudozdComments(user.id),
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
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Your Stats</Text>

        <View style={styles.statRow}>
          <StatCard label="Total Goals" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Rate" value={`${stats.completionRate}%`} />
        </View>

        <StatCard label="Followers" value={followerCount} />

        {categoryData.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Goals by Category</Text>
            <BarChart
              data={categoryData.map((c) => ({ label: c.name, value: c.count, color: c.color }))}
            />
          </View>
        )}

        {completionTrend.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Completion Rate</Text>
            <BarChart
              data={completionTrend.map((c) => ({ label: c.month.substring(5), value: c.rate, color: colors.text }))}
            />
          </View>
        )}

        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Goals</Text>
            {activeGoals.map((g) => (
              <View key={g.id} style={styles.goalRow}>
                <Text style={[styles.goalTitle, { color: colors.text }]} numberOfLines={1}>{g.title}</Text>
                <ProgressBar current={g.progress} target={100} height={6} />
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>{g.progress}%</Text>
              </View>
            ))}
          </View>
        )}

        {topGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Kudoz'd Goals</Text>
            {topGoals.map((g) => (
              <View key={g.id} style={[styles.postRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={1}>{g.title}</Text>
                <Text style={[styles.kudozCount, { color: colors.text }]}>{g.kudoz_count} Kudoz</Text>
              </View>
            ))}
          </View>
        )}

        {topPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Kudoz'd Posts</Text>
            {topPosts.map((p) => (
              <View key={p.id} style={[styles.postRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={1}>{p.content || '(no text)'}</Text>
                <Text style={[styles.kudozCount, { color: colors.text }]}>{p.kudoz_count} Kudoz</Text>
              </View>
            ))}
          </View>
        )}

        {topComments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Most Kudoz'd Comments</Text>
            {topComments.map((c) => (
              <View key={c.id} style={[styles.postRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.postContent, { color: colors.text }]} numberOfLines={1}>{c.content}</Text>
                <Text style={[styles.kudozCount, { color: colors.text }]}>{c.kudoz_count} Kudoz</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.md },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.sectionHeader, marginBottom: spacing.sm },
  goalRow: { marginBottom: spacing.md },
  goalTitle: { ...typography.body, fontWeight: '600', marginBottom: spacing.xs },
  progressText: { ...typography.caption, marginTop: spacing.xs },
  postRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1 },
  postContent: { ...typography.body, flex: 1 },
  kudozCount: { ...typography.caption, fontWeight: '600', marginLeft: spacing.sm },
});
