import React from 'react';
import { ScrollView } from 'react-native';
import { Text } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';

export function AboutScreen() {
  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text fontSize="$5" fontWeight="700" color="$color" marginBottom="$xs">About Kudoz</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$lg">Track goals that matter. Celebrate with friends.</Text>

        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Set a goal, share your progress, and let your friends cheer you on. Every post on Kudoz is tied to a real goal — no noise, just forward movement.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">Your feed, unfiltered</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          No ads. No algorithms. No data selling. Your feed shows your friends' progress in chronological order — nothing more, nothing less. What you share is yours to control.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">Simple pricing, no tricks</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Start free with up to 3 active goals. Want more? $12/year unlocks unlimited goals and commenting. No hidden fees, no upsells.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$md" marginBottom="$xs">What you won't find here</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          No rankings or leaderboards. No like counts on your profile. No streak-shaming or guilt notifications. Kudoz is built to help you grow, not to keep you scrolling.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
