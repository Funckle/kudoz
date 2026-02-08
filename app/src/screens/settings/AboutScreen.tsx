import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';

export function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>About Kudoz</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Track goals that matter. Celebrate with friends.</Text>

        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Set a goal, share your progress, and let your friends cheer you on. Every post on Kudoz is tied to a real goal — no noise, just forward movement.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your feed, unfiltered</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          No ads. No algorithms. No data selling. Your feed shows your friends' progress in chronological order — nothing more, nothing less. What you share is yours to control.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Simple pricing, no tricks</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Start free with up to 3 active goals. Want more? $12/year unlocks unlimited goals and commenting. No hidden fees, no upsells.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>What you won't find here</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          No rankings or leaderboards. No like counts on your profile. No streak-shaming or guilt notifications. Kudoz is built to help you grow, not to keep you scrolling.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.xs },
  subtitle: { ...typography.body, lineHeight: 22, marginBottom: spacing.lg },
  sectionTitle: { ...typography.sectionHeader, marginTop: spacing.md, marginBottom: spacing.xs },
  body: { ...typography.body, lineHeight: 22, marginBottom: spacing.sm },
});
