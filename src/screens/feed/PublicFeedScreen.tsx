import React, { useState, useEffect } from 'react';
import { FlatList, Modal } from 'react-native';
import { YStack, Text, useTheme } from 'tamagui';
import { PostCard } from '../../components/PostCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { supabase } from '../../services/supabase';
import type { PostWithAuthor } from '../../types/database';

interface PublicFeedScreenProps {
  onSignIn: () => void;
  onWaitlist: () => void;
  onRedeemInvite: () => void;
}

export function PublicFeedScreen({ onSignIn, onWaitlist, onRedeemInvite }: PublicFeedScreenProps) {
  const theme = useTheme();
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    supabase
      .from('posts')
      .select(`
        *,
        user:users!posts_user_id_fkey(id, name, username, avatar_url),
        goal:goals!posts_goal_id_fkey(id, title, goal_type, target_value, current_value, status)
      `)
      .eq('post_type', 'goal_completed')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setPosts((data || []).map((p: Record<string, unknown>) => ({
          ...p, kudos_count: 0, comment_count: 0, has_given_kudos: false,
        })) as PostWithAuthor[]);
        setLoading(false);
      });
  }, []);

  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (e.nativeEvent.contentOffset.y > 500 && !showGate) {
      setShowGate(true);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      />
      <Modal visible={showGate} transparent animationType="fade">
        <YStack flex={1} backgroundColor="rgba(0,0,0,0.7)" justifyContent="center" alignItems="center" padding="$lg">
          <YStack borderRadius="$md" padding="$lg" width="100%" maxWidth={360} backgroundColor="$background">
            <Text fontSize="$5" fontWeight="700" textAlign="center" marginBottom="$xs" color="$color">Join Mokudos</Text>
            <Text fontSize="$2" textAlign="center" marginBottom="$lg" color="$colorSecondary">Create goals, share progress, and celebrate with friends.</Text>
            <Button title="Sign in" onPress={onSignIn} style={{ marginBottom: 8 }} />
            <Button title="Redeem invite" onPress={onRedeemInvite} variant="secondary" style={{ marginBottom: 8 }} />
            <Button title="Join waitlist" onPress={onWaitlist} variant="secondary" style={{ marginBottom: 8 }} />
          </YStack>
        </YStack>
      </Modal>
    </YStack>
  );
}
