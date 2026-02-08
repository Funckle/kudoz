import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { supabase } from '../../services/supabase';
import { updateUserProfile } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';
import type { OnboardingScreenProps } from '../../types/navigation';
import type { User } from '../../types/database';

export function SuggestedFollowsScreen({ navigation }: OnboardingScreenProps<'SuggestedFollows'>) {
  const theme = useTheme();
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
      <XStack
        alignItems="center"
        paddingVertical="$sm"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Avatar uri={item.avatar_url} name={item.name} size={48} />
        <YStack flex={1} marginLeft="$sm">
          <Text fontSize="$3" fontWeight="600" color="$color">{item.name}</Text>
          <Text fontSize="$1" color="$colorSecondary">@{item.username}</Text>
        </YStack>
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: isFollowing ? theme.background.val : theme.color.val,
            borderWidth: isFollowing ? 1 : 0,
            borderColor: isFollowing ? theme.borderColor.val : undefined,
          }}
          onPress={() => toggleFollow(item.id)}
        >
          <Text
            fontSize="$1"
            fontWeight="600"
            color={isFollowing ? "$color" : "$background"}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </XStack>
    );
  };

  return (
    <ScreenContainer>
      <YStack flex={1} paddingHorizontal="$md" paddingTop="$xl">
        <Text fontSize="$5" fontWeight="700" marginBottom="$sm" color="$color">
          Suggested people
        </Text>
        <Text fontSize="$2" marginBottom="$lg" color="$colorSecondary">
          Follow others to see their progress in your feed.
        </Text>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={suggestedUsers}
            renderItem={renderUser}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        )}
        <YStack paddingVertical="$md">
          <Button title="Get started" onPress={handleFinish} loading={finishing} />
        </YStack>
      </YStack>
    </ScreenContainer>
  );
}
