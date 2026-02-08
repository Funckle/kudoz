import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Button } from './Button';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';
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
  const { colors } = useTheme();
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
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]}>
          {submitted ? (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Thanks for reporting</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We'll review this and take action if needed.</Text>
              <Button title="Done" onPress={handleClose} />
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: colors.text }]}>Report</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Why are you reporting this?</Text>
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.option,
                    { borderColor: colors.border },
                    selected === reason.value && { borderColor: colors.text, backgroundColor: colors.borderLight },
                  ]}
                  onPress={() => setSelected(reason.value)}
                >
                  <Text style={[
                    styles.optionText,
                    { color: colors.text },
                    selected === reason.value && { fontWeight: '600' },
                  ]}>
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
              {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
              <View style={styles.buttons}>
                <Button title="Cancel" onPress={handleClose} variant="secondary" style={styles.cancelBtn} />
                <Button
                  title="Submit"
                  onPress={handleSubmit}
                  loading={submitting}
                  disabled={!selected}
                  style={styles.submitBtn}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: spacing.md,
    borderTopRightRadius: spacing.md,
    padding: spacing.lg,
  },
  title: {
    ...typography.sectionHeader,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.md,
  },
  option: {
    padding: spacing.sm + 4,
    borderWidth: 1,
    borderRadius,
    marginBottom: spacing.sm,
  },
  optionText: {
    ...typography.body,
  },
  error: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  submitBtn: {
    flex: 1,
  },
});
