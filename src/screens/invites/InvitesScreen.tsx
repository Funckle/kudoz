import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Share, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { typography, spacing, borders, borderRadius } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { generateInviteCode, getMyInvites, getRemainingInvites } from '../../services/invites';
import type { Invite } from '../../types/database';

export function InvitesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMyInvites(user.id), getRemainingInvites(user.id)]).then(([inv, rem]) => {
      setInvites(inv.invites);
      setRemaining(rem);
      setLoading(false);
    });
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    const result = await generateInviteCode(user.id);
    setGenerating(false);
    if (result.error) {
      Alert.alert('Error', result.error);
    } else if (result.invite) {
      setInvites((prev) => [result.invite!, ...prev]);
      setRemaining((r) => r - 1);
    }
  };

  const handleShare = (code: string) => {
    Share.share({
      message: `Join me on Kudoz! Use invite code: ${code}\n\nkudoz://invite/${code}`,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Invites</Text>
        <Text style={[styles.remaining, { color: colors.textSecondary }]}>{remaining} invites remaining</Text>

        <Button
          title="Generate invite"
          onPress={handleGenerate}
          loading={generating}
          disabled={remaining <= 0}
          style={styles.generateBtn}
        />

        <FlatList
          data={invites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.inviteRow, { borderBottomColor: colors.border }]}>
              <View style={styles.inviteInfo}>
                <Text style={[styles.code, { color: colors.text }]}>{item.invite_code}</Text>
                <Text style={[styles.status, { color: colors.textSecondary }]}>
                  {item.used_by ? 'Used' : 'Available'}
                </Text>
              </View>
              {!item.used_by && (
                <Button title="Share" onPress={() => handleShare(item.invite_code)} variant="secondary" />
              )}
            </View>
          )}
          ListEmptyComponent={<EmptyState title="No invites yet" message="Generate an invite code to share with friends." />}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.xs },
  remaining: { ...typography.body, marginBottom: spacing.md },
  generateBtn: { marginBottom: spacing.md },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: borders.width },
  inviteInfo: { flex: 1 },
  code: { ...typography.goalTitle, fontFamily: undefined, letterSpacing: 1 },
  status: { ...typography.caption },
});
