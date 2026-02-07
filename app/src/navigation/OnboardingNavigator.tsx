import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UsernameSetupScreen } from '../screens/onboarding/UsernameSetupScreen';
import { CategorySelectionScreen } from '../screens/onboarding/CategorySelectionScreen';
import { SuggestedFollowsScreen } from '../screens/onboarding/SuggestedFollowsScreen';
import type { OnboardingStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />
      <Stack.Screen name="CategorySelection" component={CategorySelectionScreen} />
      <Stack.Screen name="SuggestedFollows" component={SuggestedFollowsScreen} />
    </Stack.Navigator>
  );
}
