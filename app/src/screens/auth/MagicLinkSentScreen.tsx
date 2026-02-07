import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../utils/theme';
import { sendMagicLink } from '../../services/auth';
import type { AuthScreenProps } from '../../types/navigation';

export function MagicLinkSentScreen({ route, navigation }: AuthScreenProps<'MagicLinkSent'>) {
  const { email } = route.params;
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await sendMagicLink(email);
    setResending(false);
    setResent(true);
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.message}>
          We sent a magic link to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.hint}>Tap the link in the email to sign in.</Text>
        <Button
          title={resent ? 'Sent!' : 'Resend link'}
          onPress={handleResend}
          variant="secondary"
          loading={resending}
          disabled={resent}
          style={styles.button}
        />
        <Button
          title="Use a different email"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.black,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  email: {
    fontWeight: '600',
    color: colors.black,
  },
  hint: {
    ...typography.caption,
    color: colors.gray,
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    marginBottom: spacing.sm,
  },
});
