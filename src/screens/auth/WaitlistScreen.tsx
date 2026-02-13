import React, { useState } from 'react';
import { YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { validateEmail } from '../../utils/validation';
import { joinWaitlist } from '../../services/waitlist';

export function WaitlistScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await joinWaitlist(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <ScreenContainer>
        <YStack flex={1} justifyContent="center" padding="$md">
          <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">
            You're on the list!
          </Text>
          <Text fontSize="$2" marginBottom="$xl" color="$colorSecondary">
            We'll email you when a spot opens up.
          </Text>
        </YStack>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <YStack flex={1} justifyContent="center" padding="$md">
        <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">
          Join the Waitlist
        </Text>
        <Text fontSize="$2" marginBottom="$xl" color="$colorSecondary">
          Mokudos is currently invite-only. Join the waitlist to get early access.
        </Text>
        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title="Join waitlist" onPress={handleSubmit} loading={submitting} disabled={!email.trim()} />
      </YStack>
    </ScreenContainer>
  );
}
