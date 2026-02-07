import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { CreateGoalScreen } from '../screens/goals/CreateGoalScreen';
import { EditGoalScreen } from '../screens/goals/EditGoalScreen';
import { EditPostScreen } from '../screens/posts/EditPostScreen';
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

export function RootNavigator() {
  const { loading, isAuthenticated, isNewUser } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer>
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
