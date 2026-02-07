import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { redeemInvite } from '../../services/invites';
import type { AuthScreenProps } from '../../types/navigation';

export function RedeemInviteScreen({ route, navigation }: AuthScreenProps<'RedeemInvite'>) {
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
      <View style={styles.container}>
        <Text style={styles.title}>Redeem Invite</Text>
        <Text style={styles.subtitle}>Enter your invite code to join Kudoz.</Text>
        <TextInput
          label="Invite code"
          placeholder="ABCD1234"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          error={error}
          autoCapitalize="characters"
        />
        <Button title="Redeem" onPress={handleRedeem} loading={redeeming} disabled={!code.trim()} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.md },
  title: { ...typography.title, color: colors.black, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.gray, marginBottom: spacing.xl },
});
