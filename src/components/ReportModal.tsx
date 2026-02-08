import React, { useState } from 'react';
import { TouchableOpacity, Modal } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';
import { reportContent } from '../services/reports';
import type { ContentType, ReportReason } from '../types/database';

interface ReportModalProps {
  visible: boolean;
  contentType: ContentType;
  contentId: string;
  onClose: () => void;
}

const REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'impersonation', label: 'Impersonation' },
  { value: 'inappropriate_image', label: 'Inappropriate image' },
  { value: 'other', label: 'Other' },
];

export function ReportModal({ visible, contentType, contentId, onClose }: ReportModalProps) {
  const { user } = useAuth();
  const theme = useTheme();
  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selected || !user) return;
    setSubmitting(true);
    const result = await reportContent(user.id, contentType, contentId, selected);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <YStack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
        <YStack
          borderTopLeftRadius="$md"
          borderTopRightRadius="$md"
          padding="$lg"
          backgroundColor="$surface"
        >
          {submitted ? (
            <>
              <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$xs">
                Thanks for reporting
              </Text>
              <Text fontSize="$2" color="$colorSecondary" marginBottom="$md">
                We'll review this and take action if needed.
              </Text>
              <Button title="Done" onPress={handleClose} />
            </>
          ) : (
            <>
              <Text fontSize="$4" fontWeight="600" color="$color" marginBottom="$xs">Report</Text>
              <Text fontSize="$2" color="$colorSecondary" marginBottom="$md">
                Why are you reporting this?
              </Text>
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  onPress={() => setSelected(reason.value)}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 8,
                    marginBottom: 8,
                    borderColor: selected === reason.value ? theme.color.val : theme.borderColor.val,
                    backgroundColor: selected === reason.value ? theme.borderColorLight.val : 'transparent',
                  }}
                >
                  <Text
                    fontSize="$2"
                    color="$color"
                    fontWeight={selected === reason.value ? '600' : '400'}
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {error ? <Text fontSize="$1" color="$error" marginBottom="$sm">{error}</Text> : null}
              <XStack marginTop="$sm">
                <Button title="Cancel" onPress={handleClose} variant="secondary" style={{ flex: 1, marginRight: 8 }} />
                <Button
                  title="Submit"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={!selected}
                  style={{ flex: 1 }}
                />
              </XStack>
            </>
          )}
        </YStack>
      </YStack>
    </Modal>
  );
}
