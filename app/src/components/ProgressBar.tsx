import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../utils/theme';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ current, target, color = colors.black, height = 8 }: ProgressBarProps) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${progress * 100}%`,
            backgroundColor: color,
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
    backgroundColor: colors.grayLight,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
