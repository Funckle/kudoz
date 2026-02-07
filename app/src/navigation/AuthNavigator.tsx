import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { MagicLinkSentScreen } from '../screens/auth/MagicLinkSentScreen';
import { RedeemInviteScreen } from '../screens/auth/RedeemInviteScreen';
import { WaitlistScreen } from '../screens/auth/WaitlistScreen';
import type { AuthStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="MagicLinkSent" component={MagicLinkSentScreen} />
      <Stack.Screen name="RedeemInvite" component={RedeemInviteScreen} />
      <Stack.Screen name="Waitlist" component={WaitlistScreen} />
    </Stack.Navigator>
  );
}
