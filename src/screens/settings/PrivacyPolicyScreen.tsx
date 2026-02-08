import React from 'react';
import { ScrollView, TouchableOpacity, Linking } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';

export function PrivacyPolicyScreen() {
  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text fontSize="$5" fontWeight="700" color="$color" marginBottom="$xs">Privacy Policy</Text>
        <Text fontSize="$1" color="$colorSecondary" marginBottom="$lg">Last updated: February 8, 2026</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Kudoz is built on a simple principle: your data is yours. This policy explains what we collect, why, and what we'll never do. We wrote it in plain language because we think you should actually be able to read it.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">What we collect</Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Account information</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Your email address (used for sign-in via magic link){'\n'}
          {'\u2022'} Your username, display name, bio, and avatar (what you choose to share on your profile){'\n'}
          {'\u2022'} Your website link (optional){'\n'}
          {'\u2022'} Your category interests (selected during onboarding){'\n'}
          {'\u2022'} Your default visibility preference for new goals
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Content you create</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Goals, progress updates, and comments you post{'\n'}
          {'\u2022'} Categories you assign to your goals{'\n'}
          {'\u2022'} Images you upload with your posts{'\n'}
          {'\u2022'} Kudoz reactions you give to others{'\n'}
          {'\u2022'} Reports you submit about content or users
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Social connections</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Who you follow and who follows you{'\n'}
          {'\u2022'} Users you've blocked or muted
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Subscription and invite information</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Your subscription status and expiration date{'\n'}
          {'\u2022'} Invite codes you've generated or redeemed (during our invite-only period){'\n'}
          {'\u2022'} Transactions are processed by Apple (App Store) or Google (Play Store) — we don't see or store your payment details
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Technical information</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Push notification tokens (so we can send you notifications){'\n'}
          {'\u2022'} Basic device information provided by Expo for crash reporting{'\n'}
          {'\u2022'} When you last changed your username (used to enforce rate limits)
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">What we do with it</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Display your profile, goals, and posts to other users based on your visibility settings{'\n'}
          {'\u2022'} Show you a chronological feed of people you follow{'\n'}
          {'\u2022'} Send you push notifications about activity on your posts (if enabled){'\n'}
          {'\u2022'} Enforce community guidelines through moderation{'\n'}
          {'\u2022'} Improve the app based on aggregate, anonymous usage patterns
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">What we will never do</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Sell your data. Not to advertisers, data brokers, or anyone else. Ever.{'\n'}
          {'\u2022'} Show you ads. Kudoz is funded by subscriptions, not advertising.{'\n'}
          {'\u2022'} Use third-party trackers. No Google Analytics, no Facebook Pixel, no tracking scripts.{'\n'}
          {'\u2022'} Build a behavioral profile on you. We don't analyze your usage patterns to target or manipulate you.{'\n'}
          {'\u2022'} Use an algorithmic feed. Your feed is chronological — we don't optimize for engagement.{'\n'}
          {'\u2022'} Share your data with third parties except as required to operate the service (see below).
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Third-party services</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Kudoz uses the following services to operate. These providers host or process data on our behalf — they don't actively review or analyze your content.
        </Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Supabase — Database, authentication, file storage. Your account data, content, and uploaded images are stored on their infrastructure.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://supabase.com/privacy')}>
          <Text fontSize="$2" color="$link" marginBottom="$sm">Supabase Privacy Policy</Text>
        </TouchableOpacity>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Apple / Google — Subscription payments. Payment processing only (we don't see your card details).
        </Text>
        <XStack alignItems="center" marginBottom="$sm">
          <TouchableOpacity onPress={() => Linking.openURL('https://www.apple.com/legal/privacy/')}>
            <Text fontSize="$2" color="$link">Apple Privacy Policy</Text>
          </TouchableOpacity>
          <Text fontSize="$2" color="$colorSecondary"> · </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://policies.google.com/privacy')}>
            <Text fontSize="$2" color="$link">Google Privacy Policy</Text>
          </TouchableOpacity>
        </XStack>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Expo — Push notifications and app delivery. Push notification tokens and basic device info are stored on their infrastructure.
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://expo.dev/privacy')}>
          <Text fontSize="$2" color="$link" marginBottom="$sm">Expo Privacy Policy</Text>
        </TouchableOpacity>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          We don't share your data with any other third parties.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Your visibility settings</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          You control who sees your content:{'\n\n'}
          {'\u2022'} Public — visible to anyone, including non-signed-in users{'\n'}
          {'\u2022'} Mutual followers — visible only to people you follow who also follow you back{'\n'}
          {'\u2022'} Private — visible only to you{'\n\n'}
          You can set a default visibility for new goals in Settings, and change visibility per goal at any time.{'\n\n'}
          Public content is discoverable through search and category feeds by all users, including those who aren't signed in. If you want your goals and posts to stay off search results and category feeds, set them to "Mutual followers" or "Private."
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Browsing without an account</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          You can browse a limited selection of public content without creating an account. We don't collect personal data from non-signed-in visitors. Standard server logs (IP address, user agent) are generated by our hosting providers (Vercel, Supabase) as part of normal operations, but we don't use these logs for tracking or profiling.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Data export</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          You can export all your data at any time from Settings. The export includes your goals, posts, comments, reactions, and profile information in a downloadable CSV file.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Account deletion and suspension</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          If you delete your account: You can permanently delete your account from Settings. This removes your profile, goals, posts, comments, reactions, uploaded images, follow connections, and notification history. Account deletion is permanent and irreversible. We don't retain your data after deletion.
        </Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          If we suspend your account: If your account is suspended for violating our Terms & Conditions, your account is disabled and you can't log in or interact. Your data is retained during the suspension. You can appeal a suspension by contacting us — if the decision is reversed, your account is restored.
        </Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          If we terminate your account: If your account is permanently terminated after repeated or severe violations, all your data is deleted — the same as if you deleted it yourself. We don't retain your content after termination.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Data storage and security</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Your data is stored on Supabase infrastructure. All data is transmitted over encrypted connections (HTTPS/TLS). Database access is restricted through row-level security policies — users can only access data they're authorized to see.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Image handling</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          When you upload an image, the app compresses it and strips location metadata (EXIF data) before uploading. This means your photos don't accidentally reveal where they were taken. Images are stored in Supabase Storage and served over encrypted connections.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Children</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Kudoz is not intended for users under the age of 13. We don't knowingly collect data from children. If you believe a child under 13 has created an account, contact us and we'll remove it.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Changes to this policy</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          If we change this policy, we'll update the date at the top and notify users through the app. We'll never change it in a way that weakens your privacy protections without giving you the choice to opt out.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Contact</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Questions about your privacy? Reach us at privacy@kudoz.me
        </Text>

        <YStack height="$xl" />
      </ScrollView>
    </ScreenContainer>
  );
}
