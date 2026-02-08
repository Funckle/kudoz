import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { deleteAccount } from '../../services/auth';

export function DeleteAccountScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete your profile, goals, posts, and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete my account',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;
            setDeleting(true);
            const result = await deleteAccount(user.id);
            if (result.error) {
              Alert.alert('Error', result.error);
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.error }]}>Delete Account</Text>
        <Text style={[styles.warning, { color: colors.error }]}>This action is permanent and cannot be undone.</Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          Deleting your account will remove:{'\n\n'}
          • Your profile and avatar{'\n'}
          • All your goals{'\n'}
          • All your posts and progress{'\n'}
          • All your comments{'\n'}
          • Your follower connections{'\n'}
          • Your notification history
        </Text>
        <Button
          title={deleting ? 'Deleting...' : 'Delete my account'}
          onPress={handleDelete}
          variant="destructive"
          loading={deleting}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  title: { ...typography.title, marginBottom: spacing.sm },
  warning: { ...typography.body, fontWeight: '600', marginBottom: spacing.md },
  details: { ...typography.body, marginBottom: spacing.xl, lineHeight: 22 },
});
