import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';

export function TermsScreen() {
  return (
    <ScreenContainer noTopInset>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <Text fontSize="$5" fontWeight="700" color="$color" marginBottom="$xs">Terms & Conditions</Text>
        <Text fontSize="$1" color="$colorSecondary" marginBottom="$lg">Last updated: February 8, 2026</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          These are the rules for using Mokudos. We kept them short and readable because we believe you should know what you're agreeing to. By using Mokudos, you agree to these terms.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">What Mokudos is</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Mokudos is a social goal-tracking platform where you set goals, share progress updates, and celebrate achievements with friends. It's designed to be positive, simple, and respectful of your time and data.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Your account</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} You need a valid email address to create an account{'\n'}
          {'\u2022'} You must be at least 13 years old to use Mokudos{'\n'}
          {'\u2022'} You're responsible for your account activity{'\n'}
          {'\u2022'} Your username must be appropriate and can't impersonate another person{'\n'}
          {'\u2022'} You can change your username once per day{'\n'}
          {'\u2022'} We use passwordless authentication (magic links sent to your email) — there are no passwords to manage
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Free and paid tiers</Text>
        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Free tier</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Up to 3 active goals{'\n'}
          {'\u2022'} Post progress updates, give Kudos reactions, follow users{'\n'}
          {'\u2022'} No commenting
        </Text>
        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Paid tier ($12/year)</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Unlimited goals{'\n'}
          {'\u2022'} Commenting enabled{'\n'}
          {'\u2022'} Subscription is billed annually through the App Store or Google Play Store
        </Text>
        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">If your subscription lapses</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} You drop to free tier limits{'\n'}
          {'\u2022'} Your existing goals and content remain visible{'\n'}
          {'\u2022'} You can't create new goals beyond the free limit or post comments{'\n'}
          {'\u2022'} You can reactivate anytime by renewing
        </Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Subscriptions are managed through Apple or Google. Refund requests must go through the respective app store, not through Mokudos.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Invites (Year 1)</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          During our first year, paid subscribers receive 5 invite codes with their first purchase. Invites are personal — share them with people you'd want in the community. After the first year, invites will be discontinued and signup will be open to everyone.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Content rules</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Mokudos is a place for celebrating personal progress. To keep it that way:
        </Text>
        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">What's welcome</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Goals about personal growth, fitness, health, learning, finance, career, habits, creativity, or life milestones{'\n'}
          {'\u2022'} Honest progress updates — including setbacks ("missed this week, but back at it"){'\n'}
          {'\u2022'} Supportive comments and encouragement
        </Text>
        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">What's not allowed</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Harassment, hate speech, threats, or bullying{'\n'}
          {'\u2022'} Spam, fake achievements, or misleading content{'\n'}
          {'\u2022'} Impersonation of another person{'\n'}
          {'\u2022'} Sexually explicit or violent content{'\n'}
          {'\u2022'} Content promoting illegal activity{'\n'}
          {'\u2022'} Off-topic content that isn't related to personal goals or progress (political debates, religious arguments, etc.)
        </Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Content that violates these rules may be removed. Repeated violations may result in account suspension. Continued violations after suspension may lead to permanent termination of your account and deletion of all your data.
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Automated content screening</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Mokudos uses AI-powered content screening to detect harmful content — such as hate speech, harassment, threats, and inappropriate images — before it's posted. If your content is flagged, you'll see a message and can revise it before resubmitting. This screening classifies intent, not individual words, so normal language (including casual profanity) is allowed. Automated screening is one layer of our moderation — it doesn't catch everything, which is why we also have manual reporting.
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Character limits</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Goal title: 50 characters{'\n'}
          {'\u2022'} Goal description: 280 characters{'\n'}
          {'\u2022'} Progress update: 280 characters{'\n'}
          {'\u2022'} Comment: 280 characters
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Visibility settings</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          You control who sees your goals and posts:{'\n\n'}
          {'\u2022'} Public — visible to anyone, including non-signed-in users, and discoverable through search and category feeds{'\n'}
          {'\u2022'} Mutual followers — visible only to people you follow who also follow you back{'\n'}
          {'\u2022'} Private — visible only to you{'\n\n'}
          You can set a default visibility for new goals in Settings, and change visibility per goal at any time. Posts inherit the visibility of their goal.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Your content</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} You own the content you post (goals, updates, comments, images){'\n'}
          {'\u2022'} By posting on Mokudos, you grant us a license to display your content to other users according to your visibility settings, and to store it on our servers. By using Mokudos, you agree to this license{'\n'}
          {'\u2022'} This license ends when you delete your content or your account{'\n'}
          {'\u2022'} We don't claim ownership of anything you create{'\n'}
          {'\u2022'} We don't use your content to train AI models or sell to third parties. (Content is sent to OpenAI's moderation endpoint for safety screening only — see our Privacy Policy for details.)
        </Text>

        <Text fontSize="$3" fontWeight="600" color="$color" marginTop="$sm" marginBottom="$xs">Editing and deleting your content</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Goals: You can edit the title, description, and target at any time. You cannot change a goal's type (currency, count, or milestone) after creation. Deleting a goal removes all its associated posts.{'\n'}
          {'\u2022'} Progress posts: You can edit the text and image at any time. You cannot edit the progress value (the amount added or deducted) after posting — deleting the post reverses it instead.{'\n'}
          {'\u2022'} Comments: You can edit a comment within 5 minutes of posting, as long as no one has replied to it. You can delete a comment at any time.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Images</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} You may upload one image per post{'\n'}
          {'\u2022'} Images must be your own or you must have the right to use them{'\n'}
          {'\u2022'} Images are compressed and stripped of location data (EXIF) before storage{'\n'}
          {'\u2022'} Don't upload images containing nudity, violence, offensive symbols, or content that violates our content rules{'\n'}
          {'\u2022'} Reported images are reviewed and removed if they violate these terms
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Reporting and moderation</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} You can report posts, comments, and profiles that violate these terms{'\n'}
          {'\u2022'} Reports are reviewed manually{'\n'}
          {'\u2022'} We aim to review reports promptly, but response times may vary{'\n'}
          {'\u2022'} If your content is removed, you'll be notified with an explanation{'\n'}
          {'\u2022'} If you believe a moderation decision was wrong, you can contact us
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">What we may do</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          We reserve the right to:{'\n\n'}
          {'\u2022'} Remove content that violates these terms{'\n'}
          {'\u2022'} Suspend or terminate accounts for repeated or severe violations{'\n'}
          {'\u2022'} Rate-limit posting to prevent spam (e.g., brief cooldown after rapid posting){'\n'}
          {'\u2022'} Modify, update, or discontinue features of the app{'\n'}
          {'\u2022'} Change pricing for future subscriptions (existing subscribers keep their current rate until renewal)
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">What we don't do</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} We don't sell your data or show ads (see our Privacy Policy){'\n'}
          {'\u2022'} We don't use algorithms to manipulate what you see{'\n'}
          {'\u2022'} We don't penalize you for not using the app (no streak-shaming or guilt notifications){'\n'}
          {'\u2022'} We don't lock you in — you can export your data or delete your account at any time
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Availability</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} Mokudos requires an internet connection — there's no offline mode{'\n'}
          {'\u2022'} We aim for high availability but can't guarantee uninterrupted service{'\n'}
          {'\u2022'} We may need to perform maintenance that temporarily affects access{'\n'}
          {'\u2022'} We're not liable for losses caused by service downtime
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Limitation of liability</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Mokudos is provided "as is." While we work hard to make it reliable and useful, we can't guarantee it will be error-free. To the extent permitted by law:{'\n\n'}
          {'\u2022'} We're not liable for indirect, incidental, or consequential damages{'\n'}
          {'\u2022'} Our total liability is limited to the amount you've paid us in the past 12 months{'\n'}
          {'\u2022'} We're not responsible for content posted by other users
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Suspension and termination</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          {'\u2022'} You can delete your account at any time from Settings{'\n'}
          {'\u2022'} We may suspend your account for violating these terms. A suspended account is disabled — you can't log in or interact, but your data is retained. You can appeal a suspension by contacting us{'\n'}
          {'\u2022'} For repeated or severe violations, we may permanently terminate your account. On termination, your content is permanently deleted (see our Privacy Policy){'\n'}
          {'\u2022'} Suspension comes before termination — we won't delete your data without giving you a chance to appeal, except in cases of severe violations (e.g., illegal content)
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Changes to these terms</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          If we update these terms, we'll change the date at the top and notify users through the app. Continued use of Mokudos after changes means you accept the updated terms. If you disagree with changes, you can delete your account.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Governing law</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          These terms are governed by the laws of the Netherlands.
        </Text>

        <Text fontSize="$4" fontWeight="600" color="$color" marginTop="$lg" marginBottom="$xs">Contact</Text>
        <Text fontSize="$2" color="$colorSecondary" lineHeight={22} marginBottom="$sm">
          Questions? Reach us at support@mokudos.com
        </Text>

        <YStack height="$xl" />
      </ScrollView>
    </ScreenContainer>
  );
}
