import React from 'react';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

export function SubscriptionScreen() {
  const theme = useTheme();
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
      <YStack flex={1} padding="$md" justifyContent="center">
        <Text fontSize="$5" fontWeight="700" color="$color" textAlign="center" marginBottom="$xs">{isPaid ? 'Premium' : 'Free Plan'}</Text>
        {isPaid && user?.subscription_expires_at && (
          <Text
            fontSize="$1"
            textAlign="center"
            marginBottom="$lg"
            color={isExpiring() ? '$error' : '$colorSecondary'}
          >
            {isExpiring() ? 'Expires soon: ' : 'Renews: '}
            {new Date(user.subscription_expires_at).toLocaleDateString()}
          </Text>
        )}

        <YStack padding="$lg" borderWidth={1} borderColor="$borderColor" borderRadius="$md" marginBottom="$lg">
          <Text fontSize={28} fontWeight="700" color="$color" textAlign="center">$12/year</Text>
          <Text fontSize="$1" color="$colorSecondary" textAlign="center" marginBottom="$md">That's $1/month</Text>
          {features.map((f, i) => (
            <XStack key={i} alignItems="center" marginTop="$sm">
              <Text fontSize={16} color="$color" marginRight="$sm">{'\u2713'}</Text>
              <Text fontSize="$2" color="$color">{f}</Text>
            </XStack>
          ))}
        </YStack>

        {!isPaid && (
          <Button title="Upgrade to Premium" onPress={() => {
            // In production: trigger in-app purchase flow
          }} />
        )}

        <Text fontSize="$1" color="$colorSecondary" textAlign="center" marginTop="$md">
          Subscriptions are managed through the App Store or Google Play.
        </Text>
      </YStack>
    </ScreenContainer>
  );
}
