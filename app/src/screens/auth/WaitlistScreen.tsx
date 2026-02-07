import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../utils/theme';
import { validateEmail } from '../../utils/validation';
import { joinWaitlist } from '../../services/waitlist';

export function WaitlistScreen() {
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
        <View style={styles.container}>
          <Text style={styles.title}>You're on the list!</Text>
          <Text style={styles.subtitle}>We'll email you when a spot opens up.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Join the Waitlist</Text>
        <Text style={styles.subtitle}>Kudoz is currently invite-only. Join the waitlist to get early access.</Text>
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.md },
  title: { ...typography.title, color: colors.black, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.gray, marginBottom: spacing.xl },
});
