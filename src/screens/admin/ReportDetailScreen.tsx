import React, { useState, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { ScreenContainer } from '../../components/ScreenContainer';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { Avatar } from '../../components/Avatar';
import { TextInput } from '../../components/TextInput';
import { Button } from '../../components/Button';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import {
  getReportDetail,
  getSuggestedAction,
  dismissReport,
  removeContent,
  warnUser,
  suspendUser,
  banUser,
} from '../../services/admin';
import { formatTimeAgo } from '../../utils/format';
import type { ReportWithDetails } from '../../types/database';
import type { ProfileScreenProps } from '../../types/navigation';

const SUGGESTED_LABELS: Record<string, string> = {
  warn: 'Warning',
  suspend: 'Suspend',
  ban: 'Ban',
};

export function ReportDetailScreen({ route, navigation }: ProfileScreenProps<'ReportDetail'>) {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  const { reportId } = route.params;
  const [report, setReport] = useState<ReportWithDetails | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useFocusEffect(useCallback(() => {
    getReportDetail(reportId).then(({ report: r }) => {
      if (r) setReport(r);
      setLoading(false);
    });
  }, [reportId]));

  const moderatorId = currentUser?.id;

  const handleDismiss = () => {
    if (!moderatorId || !report?.target_user?.id) return;
    Alert.alert('Dismiss report?', 'This report will be marked as dismissed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Dismiss',
        onPress: async () => {
          setActing(true);
          const result = await dismissReport(reportId, moderatorId, report.target_user!.id, notes || undefined);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
    ]);
  };

  const handleRemoveContent = () => {
    if (!moderatorId || !report?.target_user?.id) return;
    Alert.alert('Remove content?', 'The reported content will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          const result = await removeContent(
            reportId, report.content_type, report.content_id,
            moderatorId, report.target_user!.id, notes || undefined,
          );
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
    ]);
  };

  const handleWarn = () => {
    if (!moderatorId || !report?.target_user?.id) return;
    Alert.alert('Warn user?', 'The user will receive a warning notification.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Warn',
        onPress: async () => {
          setActing(true);
          const result = await warnUser(report.target_user!.id, reportId, notes || report.reason, moderatorId);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
    ]);
  };

  const handleSuspend = () => {
    if (!moderatorId || !report?.target_user?.id) return;
    Alert.alert('Suspend user', 'Choose suspension duration:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: '3 days',
        onPress: async () => {
          setActing(true);
          const result = await suspendUser(report.target_user!.id, 3, notes || report.reason, reportId, moderatorId);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
      {
        text: '7 days',
        onPress: async () => {
          setActing(true);
          const result = await suspendUser(report.target_user!.id, 7, notes || report.reason, reportId, moderatorId);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
      {
        text: '30 days',
        onPress: async () => {
          setActing(true);
          const result = await suspendUser(report.target_user!.id, 30, notes || report.reason, reportId, moderatorId);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
    ]);
  };

  const handleBan = () => {
    if (!moderatorId || !report?.target_user?.id) return;
    Alert.alert('Ban user permanently?', 'This user will be permanently banned from the platform.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: async () => {
          setActing(true);
          const result = await banUser(report.target_user!.id, notes || report.reason, reportId, moderatorId);
          setActing(false);
          if (result.error) { Alert.alert('Error', result.error); return; }
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) return <LoadingSpinner />;
  if (!report) return <ScreenContainer><Text padding="$md" color="$color">Report not found</Text></ScreenContainer>;

  const suggested = getSuggestedAction(report.violation_count ?? 0);
  const suggestedLabel = suggested.days
    ? `${SUGGESTED_LABELS[suggested.action]} (${suggested.days}d)`
    : SUGGESTED_LABELS[suggested.action] || suggested.action;

  return (
    <ScreenContainer>
      <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Reported Content */}
        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginBottom="$xs" textTransform="uppercase">
          Reported Content ({report.content_type})
        </Text>
        <YStack
          padding="$md"
          borderRadius={8}
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$surface"
          marginBottom="$lg"
        >
          <Text fontSize="$2" color="$color">{report.content_preview || '[Content unavailable]'}</Text>
        </YStack>

        {/* Report Info */}
        <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginBottom="$xs" textTransform="uppercase">
          Report Info
        </Text>
        <YStack
          padding="$md"
          borderRadius={8}
          borderWidth={1}
          borderColor="$borderColor"
          backgroundColor="$surface"
          marginBottom="$lg"
          gap="$xs"
        >
          <Text fontSize="$2" color="$color">
            Reason: {report.reason}
          </Text>
          <Text fontSize="$2" color="$colorSecondary">
            Reported by: @{report.reporter?.username || 'unknown'}
          </Text>
          <Text fontSize="$2" color="$colorSecondary">
            {formatTimeAgo(report.created_at)}
          </Text>
        </YStack>

        {/* Target User */}
        {report.target_user && (
          <>
            <Text fontSize="$1" fontWeight="600" color="$colorSecondary" marginBottom="$xs" textTransform="uppercase">
              Reported User
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('UserModeration', { userId: report.target_user!.id })}
            >
              <XStack
                padding="$md"
                borderRadius={8}
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$surface"
                marginBottom="$lg"
                alignItems="center"
              >
                <Avatar uri={report.target_user.avatar_url} name={report.target_user.name} size={40} />
                <YStack flex={1} marginLeft="$sm">
                  <Text fontSize="$2" fontWeight="600" color="$color">{report.target_user.name}</Text>
                  <Text fontSize="$1" color="$colorSecondary">@{report.target_user.username}</Text>
                </YStack>
                <YStack
                  backgroundColor={
                    (report.violation_count ?? 0) >= 3 ? '$error' : '$borderColorLight'
                  }
                  borderRadius={10}
                  paddingHorizontal={8}
                  paddingVertical={2}
                >
                  <Text
                    fontSize="$1"
                    fontWeight="600"
                    color={(report.violation_count ?? 0) >= 3 ? 'white' : '$colorSecondary'}
                  >
                    {report.violation_count ?? 0} violations
                  </Text>
                </YStack>
              </XStack>
            </TouchableOpacity>
          </>
        )}

        {/* Suggested Action */}
        <XStack marginBottom="$md" alignItems="center" gap="$xs">
          <Text fontSize="$1" fontWeight="600" color="$colorSecondary" textTransform="uppercase">
            Suggested:
          </Text>
          <YStack backgroundColor="$borderColorLight" borderRadius={4} paddingHorizontal={8} paddingVertical={2}>
            <Text fontSize="$1" fontWeight="600" color="$color">{suggestedLabel}</Text>
          </YStack>
        </XStack>

        {/* Notes */}
        <TextInput
          label="Notes (optional)"
          placeholder="Add context for the audit log..."
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Action Buttons */}
        <YStack gap="$sm" marginTop="$md">
          <Button title="Dismiss" onPress={handleDismiss} variant="secondary" disabled={acting} />
          {(report.content_type === 'post' || report.content_type === 'comment') && (
            <Button title="Remove Content" onPress={handleRemoveContent} variant="secondary" disabled={acting} />
          )}
          <Button title="Warn User" onPress={handleWarn} disabled={acting} />
          <Button title="Suspend User" onPress={handleSuspend} disabled={acting} />
          <Button title="Ban User" onPress={handleBan} variant="destructive" disabled={acting} />
        </YStack>
      </ScrollView>
    </ScreenContainer>
  );
}
