import React, { useState } from 'react';
import { YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { sendMagicLink } from '../../services/auth';
import type { AuthScreenProps } from '../../types/navigation';

export function MagicLinkSentScreen({ route, navigation }: AuthScreenProps<'MagicLinkSent'>) {
  const theme = useTheme();
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
      <YStack flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$xl">
        <Text fontSize="$5" fontWeight="700" marginBottom="$md" color="$color">
          Check your email
        </Text>
        <Text fontSize="$2" textAlign="center" marginBottom="$sm" color="$colorSecondary">
          We sent a magic link to{'\n'}
          <Text fontWeight="600" color="$color">{email}</Text>
        </Text>
        <Text fontSize="$1" marginBottom="$xl" color="$colorSecondary">
          Tap the link in the email to sign in.
        </Text>
        <Button
          title={resent ? 'Sent!' : 'Resend link'}
          onPress={handleResend}
          variant="secondary"
          loading={resending}
          disabled={resent}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <Button
          title="Use a different email"
          onPress={() => navigation.goBack()}
          variant="secondary"
          style={{ width: '100%', marginBottom: 8 }}
        />
      </YStack>
    </ScreenContainer>
  );
}
