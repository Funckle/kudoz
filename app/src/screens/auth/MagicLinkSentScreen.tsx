import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { sendMagicLink } from '../../services/auth';
import type { AuthScreenProps } from '../../types/navigation';

export function MagicLinkSentScreen({ route, navigation }: AuthScreenProps<'MagicLinkSent'>) {
  const { colors } = useTheme();
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
        <Text style={[styles.title, { color: colors.text }]}>Check your email</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          We sent a magic link to{'\n'}
          <Text style={[styles.email, { color: colors.text }]}>{email}</Text>
        </Text>
        <Text style={[styles.hint, { color: colors.textSecondary }]}>Tap the link in the email to sign in.</Text>
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
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  email: {
    fontWeight: '600',
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    marginBottom: spacing.sm,
  },
});
