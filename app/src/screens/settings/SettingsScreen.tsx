import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { typography, spacing, borderRadius } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { updateUserProfile, signOut } from '../../services/auth';
import { exportUserData } from '../../services/dataExport';
import type { ProfileScreenProps } from '../../types/navigation';
import type { Visibility } from '../../types/database';

export function SettingsScreen({ navigation }: ProfileScreenProps<'Settings'>) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const { isPaid } = useSubscription();
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>(user?.default_visibility ?? 'public');
  const [exporting, setExporting] = useState(false);

  const handleVisibilityChange = async (value: Visibility) => {
    if (!user) return;
    setDefaultVisibility(value);
    await updateUserProfile(user.id, { default_visibility: value });
    await refreshUser();
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const result = await exportUserData(user.id);
    setExporting(false);
    if (result.error) Alert.alert('Export failed', result.error);
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', onPress: signOut },
    ]);
  };

  if (!user) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={[styles.section, { color: colors.textSecondary }]}>Subscription</Text>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('Subscription')}>
          <Text style={[styles.rowText, { color: colors.text }]}>Plan</Text>
          <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{isPaid ? 'Premium' : 'Free'}</Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: colors.textSecondary }]}>Privacy</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Default visibility</Text>
        </View>
        {(['public', 'friends', 'private'] as Visibility[]).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.optionRow, { borderColor: colors.border }, defaultVisibility === v && { backgroundColor: colors.borderLight, borderColor: colors.text }]}
            onPress={() => handleVisibilityChange(v)}
          >
            <Text style={[styles.optionText, { color: colors.text }]}>{v === 'friends' ? 'Mutual followers' : v.charAt(0).toUpperCase() + v.slice(1)}</Text>
          </TouchableOpacity>
        ))}

        <Text style={[styles.section, { color: colors.textSecondary }]}>Social</Text>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('BlockedUsers')}>
          <Text style={[styles.rowText, { color: colors.text }]}>Blocked users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('MutedUsers')}>
          <Text style={[styles.rowText, { color: colors.text }]}>Muted users</Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: colors.textSecondary }]}>Data</Text>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={handleExport}>
          <Text style={[styles.rowText, { color: colors.text }]}>{exporting ? 'Exporting...' : 'Export your data'}</Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: colors.textSecondary }]}>About</Text>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('About')}>
          <Text style={[styles.rowText, { color: colors.text }]}>About Kudoz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('YourData')}>
          <Text style={[styles.rowText, { color: colors.text }]}>Your data</Text>
        </TouchableOpacity>

        <Text style={[styles.section, { color: colors.textSecondary }]}>Account</Text>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={handleSignOut}>
          <Text style={[styles.rowText, { color: colors.text }]}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.border }]} onPress={() => navigation.navigate('DeleteAccount')}>
          <Text style={[styles.rowText, { color: colors.error }]}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  section: { ...typography.caption, fontWeight: '600', marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase' },
  row: { paddingVertical: spacing.sm + 4, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowText: { ...typography.body },
  rowValue: { ...typography.body },
  optionRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: 1, borderRadius, marginBottom: spacing.xs },
  optionText: { ...typography.body },
});
