import React from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography, spacing } from '../../utils/theme';
import { useTheme } from '../../utils/ThemeContext';

export function TermsScreen() {
  const { colors } = useTheme();

  const t = (style: object) => [style, { color: colors.text }];
  const ts = (style: object) => [style, { color: colors.textSecondary }];

  return (
    <ScreenContainer>
      <ScrollView style={styles.container}>
        <Text style={t(styles.title)}>Terms & Conditions</Text>
        <Text style={ts(styles.updated)}>Last updated: February 8, 2026</Text>
        <Text style={ts(styles.body)}>
          These are the rules for using Kudoz. We kept them short and readable because we believe you should know what you're agreeing to. By using Kudoz, you agree to these terms.
        </Text>

        <Text style={t(styles.sectionTitle)}>What Kudoz is</Text>
        <Text style={ts(styles.body)}>
          Kudoz is a social goal-tracking platform where you set goals, share progress updates, and celebrate achievements with friends. It's designed to be positive, simple, and respectful of your time and data.
        </Text>

        <Text style={t(styles.sectionTitle)}>Your account</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} You need a valid email address to create an account{'\n'}
          {'\u2022'} You must be at least 13 years old to use Kudoz{'\n'}
          {'\u2022'} You're responsible for your account activity{'\n'}
          {'\u2022'} Your username must be appropriate and can't impersonate another person{'\n'}
          {'\u2022'} You can change your username once per day{'\n'}
          {'\u2022'} We use passwordless authentication (magic links sent to your email) — there are no passwords to manage
        </Text>

        <Text style={t(styles.sectionTitle)}>Free and paid tiers</Text>
        <Text style={t(styles.subsection)}>Free tier</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Up to 3 active goals{'\n'}
          {'\u2022'} Post progress updates, give Kudoz reactions, follow users{'\n'}
          {'\u2022'} No commenting
        </Text>
        <Text style={t(styles.subsection)}>Paid tier ($12/year)</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Unlimited goals{'\n'}
          {'\u2022'} Commenting enabled{'\n'}
          {'\u2022'} Subscription is billed annually through the App Store or Google Play Store
        </Text>
        <Text style={t(styles.subsection)}>If your subscription lapses</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} You drop to free tier limits{'\n'}
          {'\u2022'} Your existing goals and content remain visible{'\n'}
          {'\u2022'} You can't create new goals beyond the free limit or post comments{'\n'}
          {'\u2022'} You can reactivate anytime by renewing
        </Text>
        <Text style={ts(styles.body)}>
          Subscriptions are managed through Apple or Google. Refund requests must go through the respective app store, not through Kudoz.
        </Text>

        <Text style={t(styles.sectionTitle)}>Invites (Year 1)</Text>
        <Text style={ts(styles.body)}>
          During our first year, paid subscribers receive 5 invite codes with their first purchase. Invites are personal — share them with people you'd want in the community. After the first year, invites will be discontinued and signup will be open to everyone.
        </Text>

        <Text style={t(styles.sectionTitle)}>Content rules</Text>
        <Text style={ts(styles.body)}>
          Kudoz is a place for celebrating personal progress. To keep it that way:
        </Text>
        <Text style={t(styles.subsection)}>What's welcome</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Goals about personal growth, fitness, health, learning, finance, career, habits, creativity, or life milestones{'\n'}
          {'\u2022'} Honest progress updates — including setbacks{'\n'}
          {'\u2022'} Supportive comments and encouragement
        </Text>
        <Text style={t(styles.subsection)}>What's not allowed</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Harassment, hate speech, threats, or bullying{'\n'}
          {'\u2022'} Spam, fake achievements, or misleading content{'\n'}
          {'\u2022'} Impersonation of another person{'\n'}
          {'\u2022'} Sexually explicit or violent content{'\n'}
          {'\u2022'} Content promoting illegal activity{'\n'}
          {'\u2022'} Off-topic content that isn't related to personal goals or progress
        </Text>
        <Text style={ts(styles.body)}>
          Content that violates these rules may be removed. Repeated violations may result in account suspension. Continued violations after suspension may lead to permanent termination of your account and deletion of all your data.
        </Text>

        <Text style={t(styles.subsection)}>Automated content screening</Text>
        <Text style={ts(styles.body)}>
          Kudoz uses an automated word filter to catch profanity, slurs, and obvious harassment before it's posted. If your post or comment is flagged, you'll see a message explaining why and can edit your text before resubmitting. This filter is one layer of our moderation — it doesn't catch everything, which is why we also have manual reporting.
        </Text>

        <Text style={t(styles.subsection)}>Character limits</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Goal title: 50 characters{'\n'}
          {'\u2022'} Goal description: 280 characters{'\n'}
          {'\u2022'} Progress update: 280 characters{'\n'}
          {'\u2022'} Comment: 280 characters
        </Text>

        <Text style={t(styles.sectionTitle)}>Visibility settings</Text>
        <Text style={ts(styles.body)}>
          You control who sees your goals and posts:{'\n\n'}
          {'\u2022'} Public — visible to anyone, including non-signed-in users, and discoverable through search and category feeds{'\n'}
          {'\u2022'} Mutual followers — visible only to people you follow who also follow you back{'\n'}
          {'\u2022'} Private — visible only to you{'\n\n'}
          You can set a default visibility for new goals in Settings, and change visibility per goal at any time. Posts inherit the visibility of their goal.
        </Text>

        <Text style={t(styles.sectionTitle)}>Your content</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} You own the content you post (goals, updates, comments, images){'\n'}
          {'\u2022'} By posting on Kudoz, you grant us a license to display your content to other users according to your visibility settings, and to store it on our servers. By using Kudoz, you agree to this license{'\n'}
          {'\u2022'} This license ends when you delete your content or your account{'\n'}
          {'\u2022'} We don't claim ownership of anything you create{'\n'}
          {'\u2022'} We don't use your content to train AI models or sell to third parties
        </Text>

        <Text style={t(styles.subsection)}>Editing and deleting your content</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Goals: You can edit the title, description, and target at any time. You cannot change a goal's type (currency, count, or milestone) after creation. Deleting a goal removes all its associated posts.{'\n'}
          {'\u2022'} Progress posts: You can edit the text and image at any time. You cannot edit the progress value after posting — deleting the post reverses it instead.{'\n'}
          {'\u2022'} Comments: You can edit a comment within 5 minutes of posting, as long as no one has replied to it. You can delete a comment at any time.
        </Text>

        <Text style={t(styles.sectionTitle)}>Images</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} You may upload one image per post{'\n'}
          {'\u2022'} Images must be your own or you must have the right to use them{'\n'}
          {'\u2022'} Images are compressed and stripped of location data (EXIF) before storage{'\n'}
          {'\u2022'} Don't upload images containing nudity, violence, offensive symbols, or content that violates our content rules{'\n'}
          {'\u2022'} Reported images are reviewed and removed if they violate these terms
        </Text>

        <Text style={t(styles.sectionTitle)}>Reporting and moderation</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} You can report posts, comments, and profiles that violate these terms{'\n'}
          {'\u2022'} Reports are reviewed manually{'\n'}
          {'\u2022'} We aim to review reports promptly, but response times may vary{'\n'}
          {'\u2022'} If your content is removed, you'll be notified with an explanation{'\n'}
          {'\u2022'} If you believe a moderation decision was wrong, you can contact us
        </Text>

        <Text style={t(styles.sectionTitle)}>What we may do</Text>
        <Text style={ts(styles.body)}>
          We reserve the right to:{'\n\n'}
          {'\u2022'} Remove content that violates these terms{'\n'}
          {'\u2022'} Suspend or terminate accounts for repeated or severe violations{'\n'}
          {'\u2022'} Rate-limit posting to prevent spam{'\n'}
          {'\u2022'} Modify, update, or discontinue features of the app{'\n'}
          {'\u2022'} Change pricing for future subscriptions (existing subscribers keep their current rate until renewal)
        </Text>

        <Text style={t(styles.sectionTitle)}>What we don't do</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} We don't sell your data or show ads (see our Privacy Policy){'\n'}
          {'\u2022'} We don't use algorithms to manipulate what you see{'\n'}
          {'\u2022'} We don't penalize you for not using the app (no streak-shaming or guilt notifications){'\n'}
          {'\u2022'} We don't lock you in — you can export your data or delete your account at any time
        </Text>

        <Text style={t(styles.sectionTitle)}>Availability</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} Kudoz requires an internet connection — there's no offline mode{'\n'}
          {'\u2022'} We aim for high availability but can't guarantee uninterrupted service{'\n'}
          {'\u2022'} We may need to perform maintenance that temporarily affects access{'\n'}
          {'\u2022'} We're not liable for losses caused by service downtime
        </Text>

        <Text style={t(styles.sectionTitle)}>Limitation of liability</Text>
        <Text style={ts(styles.body)}>
          Kudoz is provided "as is." While we work hard to make it reliable and useful, we can't guarantee it will be error-free. To the extent permitted by law:{'\n\n'}
          {'\u2022'} We're not liable for indirect, incidental, or consequential damages{'\n'}
          {'\u2022'} Our total liability is limited to the amount you've paid us in the past 12 months{'\n'}
          {'\u2022'} We're not responsible for content posted by other users
        </Text>

        <Text style={t(styles.sectionTitle)}>Suspension and termination</Text>
        <Text style={ts(styles.body)}>
          {'\u2022'} You can delete your account at any time from Settings{'\n'}
          {'\u2022'} We may suspend your account for violating these terms. A suspended account is disabled — you can't log in or interact, but your data is retained. You can appeal by contacting us{'\n'}
          {'\u2022'} For repeated or severe violations, we may permanently terminate your account. On termination, your content is permanently deleted (see our Privacy Policy){'\n'}
          {'\u2022'} Suspension comes before termination — we won't delete your data without giving you a chance to appeal, except in cases of severe violations
        </Text>

        <Text style={t(styles.sectionTitle)}>Changes to these terms</Text>
        <Text style={ts(styles.body)}>
          If we update these terms, we'll change the date at the top and notify users through the app. Continued use of Kudoz after changes means you accept the updated terms. If you disagree with changes, you can delete your account.
        </Text>

        <Text style={t(styles.sectionTitle)}>Governing law</Text>
        <Text style={ts(styles.body)}>
          These terms are governed by the laws of the Netherlands.
        </Text>

        <Text style={t(styles.sectionTitle)}>Contact</Text>
        <Text style={ts(styles.body)}>
          Questions? Reach us at support@kudoz.me
        </Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { ...typography.title, marginBottom: spacing.xs },
  updated: { ...typography.caption, marginBottom: spacing.lg },
  sectionTitle: { ...typography.sectionHeader, marginTop: spacing.lg, marginBottom: spacing.xs },
  subsection: { ...typography.goalTitle, marginTop: spacing.sm, marginBottom: spacing.xs },
  body: { ...typography.body, lineHeight: 22, marginBottom: spacing.sm },
  bottomSpacer: { height: spacing.xl },
});
