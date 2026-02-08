import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Search, PlusCircle, Bell, User } from 'lucide-react-native';
import { borders } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { getUnreadCount } from '../services/notifications';

// Screens
import { FeedScreen } from '../screens/feed/FeedScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CategoryFeedScreen } from '../screens/search/CategoryFeedScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { FollowListScreen } from '../screens/profile/FollowListScreen';
import { PostDetailScreen } from '../screens/posts/PostDetailScreen';
import { GoalDetailScreen } from '../screens/goals/GoalDetailScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { SubscriptionScreen } from '../screens/settings/SubscriptionScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import { BlockedUsersScreen } from '../screens/settings/BlockedUsersScreen';
import { MutedUsersScreen } from '../screens/settings/MutedUsersScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';
import { YourDataScreen } from '../screens/settings/YourDataScreen';
import { InvitesScreen } from '../screens/invites/InvitesScreen';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen';

import type {
  MainTabParamList,
  HomeStackParamList,
  SearchStackParamList,
  NotificationsStackParamList,
  ProfileStackParamList,
} from '../types/navigation';

// Home Stack
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Feed" component={FeedScreen} options={{ title: 'Kudoz' }} />
      <HomeStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <HomeStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
      <HomeStack.Screen name="FollowList" component={FollowListScreen} options={({ route }) => ({ title: route.params.type === 'followers' ? 'Followers' : 'Following' })} />
    </HomeStack.Navigator>
  );
}

// Search Stack
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
function SearchStackNavigator() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="Search" component={SearchScreen} options={{ title: 'Discover' }} />
      <SearchStack.Screen name="CategoryFeed" component={CategoryFeedScreen} options={({ route }) => ({ title: route.params.categoryName })} />
      <SearchStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <SearchStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
      <SearchStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
      <SearchStack.Screen name="FollowList" component={FollowListScreen} options={({ route }) => ({ title: route.params.type === 'followers' ? 'Followers' : 'Following' })} />
    </SearchStack.Navigator>
  );
}

// Notifications Stack
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
function NotificationsStackNavigator() {
  return (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen name="Notifications" component={NotificationsScreen} />
      <NotificationsStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post' }} />
      <NotificationsStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
      <NotificationsStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
    </NotificationsStack.Navigator>
  );
}

// Profile Stack
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Subscription" component={SubscriptionScreen} />
      <ProfileStack.Screen name="Invites" component={InvitesScreen} />
      <ProfileStack.Screen name="Analytics" component={AnalyticsScreen} />
      <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ title: 'Delete Account' }} />
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="FollowList" component={FollowListScreen} options={({ route }) => ({ title: route.params.type === 'followers' ? 'Followers' : 'Following' })} />
      <ProfileStack.Screen name="BlockedUsers" component={BlockedUsersScreen} options={{ title: 'Blocked Users' }} />
      <ProfileStack.Screen name="MutedUsers" component={MutedUsersScreen} options={{ title: 'Muted Users' }} />
      <ProfileStack.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
      <ProfileStack.Screen name="YourData" component={YourDataScreen} options={{ title: 'Your Data' }} />
    </ProfileStack.Navigator>
  );
}

// Placeholder for Create tab (opens modal)
function CreatePlaceholder() {
  return <View />;
}

// Main Tab Navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const { colors: themeColors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopWidth: borders.width,
          borderTopColor: themeColors.border,
        },
        tabBarActiveTintColor: themeColors.text,
        tabBarInactiveTintColor: themeColors.textSecondary,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="SearchTab"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreatePlaceholder}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size + 8} />,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e: { preventDefault: () => void }) => {
            e.preventDefault();
            (navigation as any).navigate('CreateModal', { screen: 'CreatePost' });
          },
        })}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStackNavigator}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
