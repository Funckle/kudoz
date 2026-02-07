import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Modal, TouchableOpacity } from 'react-native';
import { PostCard } from '../../components/PostCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { supabase } from '../../services/supabase';
import type { PostWithAuthor } from '../../types/database';

interface PublicFeedScreenProps {
  onSignIn: () => void;
  onWaitlist: () => void;
  onRedeemInvite: () => void;
}

export function PublicFeedScreen({ onSignIn, onWaitlist, onRedeemInvite }: PublicFeedScreenProps) {
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
          ...p, kudoz_count: 0, comment_count: 0, has_kudozd: false,
        })) as PostWithAuthor[]);
        setLoading(false);
      });
  }, []);

  const handleScroll = (e: { nativeEvent: { contentOffset: { y: number } } }) => {
    if (e.nativeEvent.contentOffset.y > 300 && !showGate) {
      setShowGate(true);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      />
      <Modal visible={showGate} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.gate}>
            <Text style={styles.gateTitle}>Join Kudoz</Text>
            <Text style={styles.gateSubtitle}>Create goals, share progress, and celebrate with friends.</Text>
            <Button title="Sign in" onPress={onSignIn} style={styles.gateBtn} />
            <Button title="Redeem invite" onPress={onRedeemInvite} variant="secondary" style={styles.gateBtn} />
            <Button title="Join waitlist" onPress={onWaitlist} variant="secondary" style={styles.gateBtn} />
            <TouchableOpacity onPress={() => setShowGate(false)} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  gate: { backgroundColor: colors.white, borderTopLeftRadius: spacing.md, borderTopRightRadius: spacing.md, padding: spacing.lg },
  gateTitle: { ...typography.title, color: colors.black, textAlign: 'center', marginBottom: spacing.xs },
  gateSubtitle: { ...typography.body, color: colors.gray, textAlign: 'center', marginBottom: spacing.lg },
  gateBtn: { marginBottom: spacing.sm },
  dismissBtn: { alignItems: 'center', marginTop: spacing.sm },
  dismissText: { ...typography.caption, color: colors.gray },
});
