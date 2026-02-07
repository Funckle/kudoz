import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { colors, typography, spacing, borderRadius, borders } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

export function SubscriptionScreen() {
  const { user } = useAuth();
  const { isPaid, isExpiring } = useSubscription();

  const features = [
    'Unlimited goals (free: 3 active)',
    'Comment on posts',
    '5 invite codes',
    'Support indie development',
  ];

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>{isPaid ? 'Premium' : 'Free Plan'}</Text>
        {isPaid && user?.subscription_expires_at && (
          <Text style={[styles.expires, isExpiring() && styles.expiresWarning]}>
            {isExpiring() ? 'Expires soon: ' : 'Renews: '}
            {new Date(user.subscription_expires_at).toLocaleDateString()}
          </Text>
        )}

        <View style={styles.card}>
          <Text style={styles.price}>$12/year</Text>
          <Text style={styles.priceCaption}>That's $1/month</Text>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.feature}>{f}</Text>
            </View>
          ))}
        </View>

        {!isPaid && (
          <Button title="Upgrade to Premium" onPress={() => {
            // In production: trigger in-app purchase flow
          }} />
        )}

        <Text style={styles.note}>
          Subscriptions are managed through the App Store or Google Play.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  title: { ...typography.title, color: colors.black, textAlign: 'center', marginBottom: spacing.xs },
  expires: { ...typography.caption, color: colors.gray, textAlign: 'center', marginBottom: spacing.lg },
  expiresWarning: { color: colors.red },
  card: { padding: spacing.lg, borderWidth: borders.width, borderColor: borders.color, borderRadius, marginBottom: spacing.lg },
  price: { fontSize: 28, fontWeight: '700', color: colors.black, textAlign: 'center' },
  priceCaption: { ...typography.caption, color: colors.gray, textAlign: 'center', marginBottom: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  check: { fontSize: 16, color: colors.black, marginRight: spacing.sm },
  feature: { ...typography.body, color: colors.black },
  note: { ...typography.caption, color: colors.gray, textAlign: 'center', marginTop: spacing.md },
});
