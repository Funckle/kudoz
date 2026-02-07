import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, typography, spacing, borders, borderRadius } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { updateUserProfile, signOut } from '../../services/auth';
import { exportUserData } from '../../services/dataExport';
import type { ProfileScreenProps } from '../../types/navigation';
import type { Visibility } from '../../types/database';

export function SettingsScreen({ navigation }: ProfileScreenProps<'Settings'>) {
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
        <Text style={styles.section}>Subscription</Text>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Subscription')}>
          <Text style={styles.rowText}>Plan</Text>
          <Text style={styles.rowValue}>{isPaid ? 'Premium' : 'Free'}</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Privacy</Text>
        <View style={styles.row}>
          <Text style={styles.rowText}>Default visibility</Text>
        </View>
        {(['public', 'friends', 'private'] as Visibility[]).map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.optionRow, defaultVisibility === v && styles.optionActive]}
            onPress={() => handleVisibilityChange(v)}
          >
            <Text style={styles.optionText}>{v === 'friends' ? 'Mutual followers' : v.charAt(0).toUpperCase() + v.slice(1)}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.section}>Social</Text>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('BlockedUsers')}>
          <Text style={styles.rowText}>Blocked users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('MutedUsers')}>
          <Text style={styles.rowText}>Muted users</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Data</Text>
        <TouchableOpacity style={styles.row} onPress={handleExport}>
          <Text style={styles.rowText}>{exporting ? 'Exporting...' : 'Export your data'}</Text>
        </TouchableOpacity>

        <Text style={styles.section}>Account</Text>
        <TouchableOpacity style={styles.row} onPress={handleSignOut}>
          <Text style={styles.rowText}>Sign out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('DeleteAccount')}>
          <Text style={[styles.rowText, styles.destructive]}>Delete account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  section: { ...typography.caption, fontWeight: '600', color: colors.gray, marginTop: spacing.lg, marginBottom: spacing.sm, textTransform: 'uppercase' },
  row: { paddingVertical: spacing.sm + 4, borderBottomWidth: borders.width, borderBottomColor: borders.color, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowText: { ...typography.body, color: colors.black },
  rowValue: { ...typography.body, color: colors.gray },
  optionRow: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderWidth: borders.width, borderColor: borders.color, borderRadius, marginBottom: spacing.xs },
  optionActive: { backgroundColor: colors.grayLighter, borderColor: colors.black },
  optionText: { ...typography.body, color: colors.black },
  destructive: { color: colors.red },
});
