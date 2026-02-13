import React, { useState, useEffect } from 'react';
import { FlatList, Share, Alert } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { generateInviteCode, getMyInvites, getRemainingInvites } from '../../services/invites';
import type { Invite } from '../../types/database';

export function InvitesScreen() {
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
      message: `Join me on Mokudos! Use invite code: ${code}\n\nmokudos://invite/${code}`,
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScreenContainer noTopInset>
      <YStack flex={1} padding="$md">
        <Text fontSize="$5" fontWeight="700" marginBottom="$xs" color="$color">Invites</Text>
        <Text fontSize="$2" marginBottom="$md" color="$colorSecondary">{remaining} invites remaining</Text>

        <Button
          title="Generate invite"
          onPress={handleGenerate}
          loading={generating}
          disabled={remaining <= 0}
          style={{ marginBottom: 16 }}
        />

        <FlatList
          data={invites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <XStack paddingVertical="$sm" borderBottomWidth={1} borderBottomColor="$borderColor" justifyContent="space-between" alignItems="center">
              <YStack flex={1}>
                <Text fontSize="$3" fontWeight="600" letterSpacing={1} color="$color">{item.invite_code}</Text>
                <Text fontSize="$1" color="$colorSecondary">
                  {item.used_by ? 'Used' : 'Available'}
                </Text>
              </YStack>
              {!item.used_by && (
                <Button title="Share" onPress={() => handleShare(item.invite_code)} variant="secondary" />
              )}
            </XStack>
          )}
          ListEmptyComponent={<EmptyState title="No invites yet" message="Generate an invite code to share with friends." />}
        />
      </YStack>
    </ScreenContainer>
  );
}
