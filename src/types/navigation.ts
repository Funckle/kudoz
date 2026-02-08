import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth stack
export type AuthStackParamList = {
  SignIn: undefined;
  MagicLinkSent: { email: string };
  RedeemInvite: { code?: string } | undefined;
  Waitlist: undefined;
};

// Onboarding stack
export type OnboardingStackParamList = {
  UsernameSetup: undefined;
  CategorySelection: undefined;
  SuggestedFollows: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

// Main tab navigator
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  SearchTab: NavigatorScreenParams<SearchStackParamList>;
  CreateTab: undefined;
  NotificationsTab: NavigatorScreenParams<NotificationsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Home stack
export type HomeStackParamList = {
  Feed: undefined;
  PostDetail: { postId: string };
  GoalDetail: { goalId: string };
  UserProfile: { userId: string };
  FollowList: { userId: string; type: 'followers' | 'following' };
};

// Search stack
export type SearchStackParamList = {
  Search: undefined;
  CategoryFeed: { categoryId: string; categoryName: string };
  PostDetail: { postId: string };
  GoalDetail: { goalId: string };
  UserProfile: { userId: string };
  FollowList: { userId: string; type: 'followers' | 'following' };
};

// Notifications stack
export type NotificationsStackParamList = {
  Notifications: undefined;
  PostDetail: { postId: string };
  GoalDetail: { goalId: string };
  UserProfile: { userId: string };
};

// Profile stack
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  GoalDetail: { goalId: string };
  Settings: undefined;
  Subscription: undefined;
  Invites: undefined;
  Analytics: undefined;
  DeleteAccount: undefined;
  UserProfile: { userId: string };
  FollowList: { userId: string; type: 'followers' | 'following' };
  BlockedUsers: undefined;
  MutedUsers: undefined;
  About: undefined;
  YourData: undefined;
  PrivacyPolicy: undefined;
  Terms: undefined;
};

// Create stack (modal)
export type CreateStackParamList = {
  CreatePost: { goalId?: string } | undefined;
  CreateGoal: undefined;
  EditGoal: { goalId: string };
  EditPost: { postId: string };
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  CreateModal: NavigatorScreenParams<CreateStackParamList>;
};

// Screen prop types
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = NativeStackScreenProps<OnboardingStackParamList, T>;
export type HomeScreenProps<T extends keyof HomeStackParamList> = NativeStackScreenProps<HomeStackParamList, T>;
export type SearchScreenProps<T extends keyof SearchStackParamList> = NativeStackScreenProps<SearchStackParamList, T>;
export type ProfileScreenProps<T extends keyof ProfileStackParamList> = NativeStackScreenProps<ProfileStackParamList, T>;
export type CreateScreenProps<T extends keyof CreateStackParamList> = NativeStackScreenProps<CreateStackParamList, T>;
export type NotificationsScreenProps<T extends keyof NotificationsStackParamList> = NativeStackScreenProps<NotificationsStackParamList, T>;
