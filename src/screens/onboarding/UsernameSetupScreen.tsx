import React, { useState, useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { LIMITS, validateUsername } from '../../utils/validation';
import { checkUsernameAvailable, updateUserProfile } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import type { OnboardingScreenProps } from '../../types/navigation';

export function UsernameSetupScreen({ navigation }: OnboardingScreenProps<'UsernameSetup'>) {
  const theme = useTheme();
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
      <YStack flex={1} justifyContent="center" paddingHorizontal="$md">
        <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">
          Choose your username
        </Text>
        <Text fontSize="$2" marginBottom="$xl" color="$colorSecondary">
          This is how others will find you.
        </Text>
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
        <Text
          fontSize="$1"
          marginBottom="$md"
          marginTop={-8}
          color="$colorSecondary"
        >
          Lowercase letters, numbers, and underscores.{'\n'}
          {LIMITS.USERNAME_MIN}-{LIMITS.USERNAME_MAX} characters.
        </Text>
        <Button
          title={checking ? 'Checking...' : 'Continue'}
          onPress={handleSubmit}
          loading={loading}
          disabled={!isValid}
        />
        <XStack flexWrap="wrap" justifyContent="center" marginTop="$lg">
          <Text fontSize="$1" color="$colorSecondary">By continuing, you agree to our </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text fontSize="$1" fontWeight="600" color="$color">Terms</Text>
          </TouchableOpacity>
          <Text fontSize="$1" color="$colorSecondary"> and </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text fontSize="$1" fontWeight="600" color="$color">Privacy Policy</Text>
          </TouchableOpacity>
        </XStack>
      </YStack>
    </ScreenContainer>
  );
}
