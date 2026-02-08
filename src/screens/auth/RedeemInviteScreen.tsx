import React, { useState } from 'react';
import { Alert } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { redeemInvite } from '../../services/invites';
import type { AuthScreenProps } from '../../types/navigation';

export function RedeemInviteScreen({ route, navigation }: AuthScreenProps<'RedeemInvite'>) {
  const theme = useTheme();
  const { user } = useAuth();
  const [code, setCode] = useState(route.params?.code || '');
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');

  const handleRedeem = async () => {
    if (!user || !code.trim()) return;
    setRedeeming(true);
    setError('');
    const result = await redeemInvite(code.trim(), user.id);
    setRedeeming(false);
    if (result.error) {
      setError(result.error);
    } else {
      Alert.alert('Welcome!', 'Invite redeemed successfully.', [
        { text: 'Continue', onPress: () => navigation.navigate('SignIn') },
      ]);
    }
  };

  return (
    <ScreenContainer>
      <YStack flex={1} justifyContent="center" padding="$md">
        <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">
          Redeem Invite
        </Text>
        <Text fontSize="$2" marginBottom="$xl" color="$colorSecondary">
          Enter your invite code to join Kudoz.
        </Text>
        <TextInput
          label="Invite code"
          placeholder="ABCD1234"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          error={error}
          autoCapitalize="characters"
        />
        <Button title="Redeem" onPress={handleRedeem} loading={redeeming} disabled={!code.trim()} />
      </YStack>
    </ScreenContainer>
  );
}
