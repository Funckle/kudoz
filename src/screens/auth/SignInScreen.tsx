import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { validateEmail } from '../../utils/validation';
import { sendMagicLink, signInWithPassword } from '../../services/auth';
import type { AuthScreenProps } from '../../types/navigation';

export function SignInScreen({ navigation }: AuthScreenProps<'SignIn'>) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setLoading(true);
    if (password) {
      const result = await signInWithPassword(email, password);
      setLoading(false);
      if (result.error) setError(result.error);
    } else {
      const result = await sendMagicLink(email);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        navigation.navigate('MagicLinkSent', { email });
      }
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'center' }}
      >
        <YStack paddingHorizontal="$md">
          <Text
            fontSize={32}
            fontWeight="700"
            textAlign="center"
            marginBottom="$sm"
            color="$color"
          >
            Kudoz
          </Text>
          <Text
            fontSize="$2"
            textAlign="center"
            marginBottom="$xl"
            color="$colorSecondary"
          >
            Track goals. Share progress. Celebrate together.
          </Text>
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
          <TextInput
            label="Password (optional)"
            placeholder="Leave empty for magic link"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            title={password ? "Sign in" : "Send magic link"}
            onPress={handleSignIn}
            loading={loading}
            disabled={!email.trim()}
          />
        </YStack>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
