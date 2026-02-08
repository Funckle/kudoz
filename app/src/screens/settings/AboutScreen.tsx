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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>How Kudoz Works</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Kudoz is a social goal-tracking platform. Set goals, post progress updates, and celebrate
          achievements with friends. Give "Kudoz" to cheer others on.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Model</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Kudoz offers a free tier with up to 3 active goals. Premium subscribers unlock unlimited
          goals and commenting. We believe in a sustainable business model — no ads, no data selling,
          just a simple subscription.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>No Ads, No Tracking</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          We don't show advertisements. We don't sell your data. We don't use third-party trackers.
          Your goal progress and personal information stay private.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Values — TPPS</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Every decision at Kudoz follows our core principles, in order of priority:
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>Transparency — Be open about how the platform works</Text>
        <Text style={[styles.value, { color: colors.text }]}>Positivity — Foster encouragement, not comparison</Text>
        <Text style={[styles.value, { color: colors.text }]}>Prevention — Protect users from harm proactively</Text>
        <Text style={[styles.value, { color: colors.text }]}>Simplicity — Keep things simple and focused</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.lg },
  sectionTitle: { ...typography.sectionHeader, marginTop: spacing.md, marginBottom: spacing.xs },
  body: { ...typography.body, lineHeight: 22, marginBottom: spacing.sm },
  value: { ...typography.body, marginLeft: spacing.md, marginBottom: spacing.xs },
});
