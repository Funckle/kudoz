import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { colors, typography, spacing } from '../../utils/theme';
import { validateEmail } from '../../utils/validation';
import { sendMagicLink } from '../../services/auth';
import type { AuthScreenProps } from '../../types/navigation';

export function SignInScreen({ navigation }: AuthScreenProps<'SignIn'>) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendLink = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setLoading(true);
    const result = await sendMagicLink(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      navigation.navigate('MagicLinkSent', { email });
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Kudoz</Text>
          <Text style={styles.subtitle}>Track goals. Share progress. Celebrate together.</Text>
          <TextInput
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            title="Send magic link"
            onPress={handleSendLink}
            loading={loading}
            disabled={!email.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.black,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
