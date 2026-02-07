import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { StatCard } from '../../components/StatCard';
import { BarChart } from '../../components/BarChart';
import { ProgressBar } from '../../components/ProgressBar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, typography, spacing, borders, borderRadius } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { getGoalStats, getActiveGoalProgress, getFollowerGrowth, getMostKudozdPosts } from '../../services/analytics';

export function AnalyticsScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, completionRate: 0 });
  const [activeGoals, setActiveGoals] = useState<Array<{ id: string; title: string; progress: number }>>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [topPosts, setTopPosts] = useState<Array<{ id: string; content: string; kudoz_count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getGoalStats(user.id),
      getActiveGoalProgress(user.id),
      getFollowerGrowth(user.id),
      getMostKudozdPosts(user.id),
    ]).then(([s, g, f, p]) => {
      setStats(s);
      setActiveGoals(g);
      setFollowerCount(f.count);
      setTopPosts(p);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Stats</Text>

        <View style={styles.statRow}>
          <StatCard label="Total Goals" value={stats.total} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Rate" value={`${stats.completionRate}%`} />
        </View>

        <StatCard label="Followers" value={followerCount} />

        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Goals</Text>
            {activeGoals.map((g) => (
              <View key={g.id} style={styles.goalRow}>
                <Text style={styles.goalTitle} numberOfLines={1}>{g.title}</Text>
                <ProgressBar current={g.progress} target={100} height={6} />
                <Text style={styles.progressText}>{g.progress}%</Text>
              </View>
            ))}
          </View>
        )}

        {topPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Kudoz'd Posts</Text>
            {topPosts.map((p) => (
              <View key={p.id} style={styles.postRow}>
                <Text style={styles.postContent} numberOfLines={1}>{p.content || '(no text)'}</Text>
                <Text style={styles.kudozCount}>{p.kudoz_count} Kudoz</Text>
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
  title: { ...typography.title, color: colors.black, marginBottom: spacing.md },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  section: { marginTop: spacing.md },
  sectionTitle: { ...typography.sectionHeader, color: colors.black, marginBottom: spacing.sm },
  goalRow: { marginBottom: spacing.md },
  goalTitle: { ...typography.body, fontWeight: '600', color: colors.black, marginBottom: spacing.xs },
  progressText: { ...typography.caption, color: colors.gray, marginTop: spacing.xs },
  postRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: borders.width, borderBottomColor: borders.color },
  postContent: { ...typography.body, color: colors.black, flex: 1 },
  kudozCount: { ...typography.caption, fontWeight: '600', color: colors.black, marginLeft: spacing.sm },
});
