// Enums
export type GoalType = 'currency' | 'count' | 'milestone';
export type Visibility = 'public' | 'friends' | 'private';
export type PostType = 'progress' | 'goal_created' | 'goal_completed';
export type GoalStatus = 'active' | 'completed';
export type SubscriptionStatus = 'active' | 'lapsed' | 'none';
export type NotificationType =
  | 'kudoz'
  | 'comment'
  | 'comment_kudoz'
  | 'follow'
  | 'mutual_follow'
  | 'goal_completed'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'weekly_summary'
  | 'social_digest'
  | 'quarterly_reflection'
  | 'milestone_reached'
  | 'target_date_reached';
export type ContentType = 'post' | 'comment' | 'user' | 'goal';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'impersonation'
  | 'inappropriate_image'
  | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'actioned' | 'dismissed';

// Core interfaces
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  username_changed_at?: string;
  bio?: string;
  avatar_url?: string;
  website?: string;
  default_visibility: Visibility;
  invites_remaining: number;
  invited_by?: string;
  subscription_status: SubscriptionStatus;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  onboarded: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal_type: GoalType;
  target_value?: number;
  current_value: number;
  stakes?: string;
  effort_label?: string;
  effort_target?: number;
  visibility: Visibility;
  status: GoalStatus;
  created_at: string;
  completed_at?: string;
}

export interface GoalCategory {
  goal_id: string;
  category_id: string;
}

export interface Post {
  id: string;
  user_id: string;
  goal_id: string;
  content?: string;
  post_type: PostType;
  progress_value?: number;
  media_url?: string;
  media_type?: 'image';
  media_width?: number;
  media_height?: number;
  media_size_bytes?: number;
  created_at: string;
  updated_at?: string;
  edited_at?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  parent_comment_id?: string;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface Reaction {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface CommentReaction {
  id: string;
  user_id: string;
  comment_id: string;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  content_type: ContentType;
  content_id: string;
  reason: ReportReason;
  status: ReportStatus;
  created_at: string;
  reviewed_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
  read_at?: string;
  delivered_at?: string;
}

export interface Invite {
  id: string;
  inviter_id: string;
  invite_code: string;
  used_by?: string;
  created_at: string;
  used_at?: string;
}

export interface WaitlistEntry {
  id: string;
  email: string;
  created_at: string;
  invited_at?: string;
}

export interface Block {
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export interface Mute {
  muter_id: string;
  muted_id: string;
  created_at: string;
}

// Joined/enriched types used in the app
export interface PostWithAuthor extends Post {
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar_url'>;
  goal: Pick<Goal, 'id' | 'title' | 'goal_type' | 'target_value' | 'current_value' | 'status'>;
  categories?: Category[];
  kudoz_count: number;
  comment_count: number;
  has_kudozd: boolean;
}

export interface CommentWithAuthor extends Comment {
  user: Pick<User, 'id' | 'name' | 'username' | 'avatar_url'>;
  replies?: CommentWithAuthor[];
  kudoz_count: number;
  has_kudozd: boolean;
}

export interface GoalWithCategories extends Goal {
  categories: Category[];
}

export interface NotificationWithData extends Notification {
  actor?: Pick<User, 'id' | 'name' | 'username' | 'avatar_url'>;
}
