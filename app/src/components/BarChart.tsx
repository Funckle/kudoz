import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../utils/theme';
import { useTheme } from '../utils/ThemeContext';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
}

export function BarChart({ data, height = 120 }: BarChartProps) {
  const { colors } = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.bars, { height }]}>
        {data.map((item, index) => (
          <View key={index} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: (item.value / maxValue) * height,
                  backgroundColor: item.color || colors.text,
                },
              ]}
            />
            <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    borderRadius: 4,
    minHeight: 2,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
});
