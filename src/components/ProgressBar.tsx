import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ current, target, color, height = 8 }: ProgressBarProps) {
  const { colors } = useTheme();
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const barColor = color || colors.text;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${progress * 100}%`,
            backgroundColor: barColor,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
