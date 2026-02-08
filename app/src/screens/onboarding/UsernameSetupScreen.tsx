import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { LIMITS, validateUsername } from '../../utils/validation';
import { checkUsernameAvailable, updateUserProfile } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import type { OnboardingScreenProps } from '../../types/navigation';

export function UsernameSetupScreen({ navigation }: OnboardingScreenProps<'UsernameSetup'>) {
  const { colors } = useTheme();
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleUsernameChange = useCallback(async (text: string) => {
    const lower = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(lower);
    setError('');

    if (lower.length < LIMITS.USERNAME_MIN) return;

    const validation = validateUsername(lower);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setChecking(true);
    const available = await checkUsernameAvailable(lower);
    setChecking(false);
    if (!available) {
      setError('Username is taken');
    }
  }, []);

  const handleSubmit = async () => {
    const validation = validateUsername(username);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    setLoading(true);
    const available = await checkUsernameAvailable(username);
    if (!available) {
      setError('Username is taken');
      setLoading(false);
      return;
    }

    const result = await updateUserProfile(user!.id, { username });
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      await refreshUser();
      navigation.navigate('CategorySelection');
    }
  };

  const isValid = username.length >= LIMITS.USERNAME_MIN && !error && !checking;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Choose your username</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>This is how others will find you.</Text>
        <TextInput
          label="Username"
          placeholder="your_username"
          value={username}
          onChangeText={handleUsernameChange}
          maxLength={LIMITS.USERNAME_MAX}
          error={error}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={[styles.rules, { color: colors.textSecondary }]}>
          Lowercase letters, numbers, and underscores.{'\n'}
          {LIMITS.USERNAME_MIN}-{LIMITS.USERNAME_MAX} characters.
        </Text>
        <Button
          title={checking ? 'Checking...' : 'Continue'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!isValid}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  rules: {
    ...typography.caption,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
  },
});
