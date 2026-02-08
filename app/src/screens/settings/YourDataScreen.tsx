import React from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import type { ProfileScreenProps } from '../../types/navigation';

export function YourDataScreen({ navigation }: ProfileScreenProps<'YourData'>) {
  const { colors } = useTheme();

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Your Data</Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>What We Collect</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          We store only what's necessary to make Kudoz work: your email address, profile information
          (name, username, bio, avatar), goals, posts, comments, reactions, and follow relationships.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>How It's Used</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Your data is used exclusively to provide the Kudoz service. We show your goals and posts to
          people you've chosen to share with based on your visibility settings. We never sell your data
          or share it with advertisers.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Storage</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Your data is stored securely using Supabase (built on PostgreSQL) with row-level security.
          Only you can access your private data.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rights</Text>

        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('Settings')}>
          <Text style={[styles.actionText, { color: colors.text }]}>Export your data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('DeleteAccount')}>
          <Text style={[styles.actionText, { color: colors.error }]}>Delete your account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.lg },
  sectionTitle: { ...typography.sectionHeader, marginTop: spacing.md, marginBottom: spacing.xs },
  body: { ...typography.body, lineHeight: 22, marginBottom: spacing.sm },
  actionRow: {
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: 1,
  },
  actionText: { ...typography.body },
});
