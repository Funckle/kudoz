import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { exportUserData } from '../../services/dataExport';
import type { ProfileScreenProps } from '../../types/navigation';

export function YourDataScreen({ navigation }: ProfileScreenProps<'YourData'>) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const result = await exportUserData(user.id);
    setExporting(false);
    if (result.error) Alert.alert('Export failed', result.error);
  };

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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Where It Lives</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Your data is stored securely on protected servers. Other users can only see what you've chosen to share. Kudoz administrators can access data when needed to run and maintain the service, but we'll never share it with anyone else.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rights</Text>

        <TouchableOpacity style={[styles.actionRow, { borderBottomColor: colors.border }]} onPress={handleExport} disabled={exporting}>
          <Text style={[styles.actionText, { color: colors.text }]}>{exporting ? 'Exporting...' : 'Export your data'}</Text>
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
