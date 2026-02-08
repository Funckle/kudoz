import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, spacing, borderRadius } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface SubscriptionBannerProps {
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function SubscriptionBanner({ onUpgrade, onDismiss }: SubscriptionBannerProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.warning, borderBottomColor: colors.warningAccent }]}>
      <View style={styles.content}>
        <Text style={[styles.text, { color: colors.warningText }]}>
          Your subscription has expired. Upgrade to create new goals and comment.
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: colors.warningAccent }]} onPress={onUpgrade}>
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.dismiss, { color: colors.warningText }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    ...typography.caption,
    flex: 1,
    marginRight: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upgradeBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius,
    marginRight: spacing.sm,
  },
  upgradeText: {
    ...typography.caption,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dismiss: {
    fontSize: 16,
  },
});
