import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, typography, spacing, borderRadius, borders } from '../../utils/theme';
import { supabase } from '../../services/supabase';
import { updateUserProfile } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import type { OnboardingScreenProps } from '../../types/navigation';
import type { User } from '../../types/database';

export function SuggestedFollowsScreen({ navigation }: OnboardingScreenProps<'SuggestedFollows'>) {
  const { user, refreshUser } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    loadSuggested();
  }, []);

  const loadSuggested = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .neq('id', user?.id)
      .eq('onboarded', true)
      .limit(20);
    setSuggestedUsers((data as User[]) || []);
    setLoading(false);
  };

  const toggleFollow = async (userId: string) => {
    const isFollowing = following.has(userId);
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(userId);
      else next.add(userId);
      return next;
    });

    if (isFollowing) {
      await supabase.from('follows').delete().match({ follower_id: user!.id, following_id: userId });
    } else {
      await supabase.from('follows').insert({ follower_id: user!.id, following_id: userId });
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    await updateUserProfile(user!.id, { onboarded: true });
    await refreshUser();
    setFinishing(false);
  };

  const renderUser = ({ item }: { item: User }) => {
    const isFollowing = following.has(item.id);
    return (
      <View style={styles.userRow}>
        <Avatar uri={item.avatar_url} name={item.name} size={48} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userHandle}>@{item.username}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={() => toggleFollow(item.id)}
        >
          <Text style={[styles.followText, isFollowing && styles.followingText]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Suggested people</Text>
        <Text style={styles.subtitle}>Follow others to see their progress in your feed.</Text>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={suggestedUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}
        <View style={styles.buttons}>
          <Button title="Get started" onPress={handleFinish} loading={finishing} />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },
  title: {
    ...typography.title,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginBottom: spacing.lg,
  },
  list: {
    paddingBottom: spacing.md,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: borders.width,
    borderBottomColor: borders.color,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  userName: {
    ...typography.goalTitle,
    color: colors.black,
  },
  userHandle: {
    ...typography.caption,
    color: colors.gray,
  },
  followBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius,
    backgroundColor: colors.black,
  },
  followingBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  followText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
  followingText: {
    color: colors.black,
  },
  buttons: {
    paddingVertical: spacing.md,
  },
});
