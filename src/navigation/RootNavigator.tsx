import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, NavigationContainerRef, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'tamagui';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { CreateGoalScreen } from '../screens/goals/CreateGoalScreen';
import { EditGoalScreen } from '../screens/goals/EditGoalScreen';
import { EditPostScreen } from '../screens/posts/EditPostScreen';
import { linking } from '../services/linking';
import type { RootStackParamList, CreateStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const CreateStack = createNativeStackNavigator<CreateStackParamList>();

function CreateModalNavigator() {
  return (
    <CreateStack.Navigator>
      <CreateStack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'New Post' }} />
      <CreateStack.Screen name="CreateGoal" component={CreateGoalScreen} options={{ title: 'New Goal' }} />
      <CreateStack.Screen name="EditGoal" component={EditGoalScreen} options={{ title: 'Edit Goal' }} />
      <CreateStack.Screen name="EditPost" component={EditPostScreen} options={{ title: 'Edit Post' }} />
    </CreateStack.Navigator>
  );
}

interface RootNavigatorProps {
  navigationRef?: React.RefObject<NavigationContainerRef<Record<string, unknown>> | null>;
}

export function RootNavigator({ navigationRef }: RootNavigatorProps) {
  const { loading, isAuthenticated, isNewUser } = useAuth();
  const theme = useTheme();
  const isDark = useColorScheme() === 'dark';

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: theme.background.val, card: theme.surface.val, text: theme.color.val, border: theme.borderColor.val },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: theme.background.val, card: theme.surface.val, text: theme.color.val, border: theme.borderColor.val },
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer linking={linking} ref={navigationRef} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isNewUser ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen
                name="CreateModal"
                component={CreateModalNavigator}
                options={{ headerShown: false }}
              />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
