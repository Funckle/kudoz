import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { typography, spacing, borderRadius, borders } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

export function SubscriptionScreen() {
  const { colors } = useTheme();
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
        <Text style={[styles.title, { color: colors.text }]}>{isPaid ? 'Premium' : 'Free Plan'}</Text>
        {isPaid && user?.subscription_expires_at && (
          <Text style={[styles.expires, { color: colors.textSecondary }, isExpiring() && { color: colors.error }]}>
            {isExpiring() ? 'Expires soon: ' : 'Renews: '}
            {new Date(user.subscription_expires_at).toLocaleDateString()}
          </Text>
        )}

        <View style={[styles.card, { borderColor: colors.border }]}>
          <Text style={[styles.price, { color: colors.text }]}>$12/year</Text>
          <Text style={[styles.priceCaption, { color: colors.textSecondary }]}>That's $1/month</Text>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={[styles.check, { color: colors.text }]}>✓</Text>
              <Text style={[styles.feature, { color: colors.text }]}>{f}</Text>
            </View>
          ))}
        </View>

        {!isPaid && (
          <Button title="Upgrade to Premium" onPress={() => {
            // In production: trigger in-app purchase flow
          }} />
        )}

        <Text style={[styles.note, { color: colors.textSecondary }]}>
          Subscriptions are managed through the App Store or Google Play.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  title: { ...typography.title, textAlign: 'center', marginBottom: spacing.xs },
  expires: { ...typography.caption, textAlign: 'center', marginBottom: spacing.lg },
  card: { padding: spacing.lg, borderWidth: borders.width, borderRadius, marginBottom: spacing.lg },
  price: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  priceCaption: { ...typography.caption, textAlign: 'center', marginBottom: spacing.md },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  check: { fontSize: 16, marginRight: spacing.sm },
  feature: { ...typography.body },
  note: { ...typography.caption, textAlign: 'center', marginTop: spacing.md },
});
