import React from 'react';
import { View, Text } from 'react-native';
import type { ViewProps } from 'react-native';

export interface ProgressBarProps extends ViewProps {
  value: number;        // 0–100
  showLabel?: boolean;
  label?: string;
  height?: 'sm' | 'md' | 'lg';
  color?: 'gold' | 'success' | 'info';
}

const heightStyles = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-4',
};

const colorStyles = {
  gold: 'bg-hair-gold',
  success: 'bg-success',
  info: 'bg-info',
};

export const ProgressBar = ({
  value,
  showLabel = false,
  label,
  height = 'md',
  color = 'gold',
  className = '',
  ...props
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <View className={`w-full ${className}`} {...props}>
      {(showLabel || label) && (
        <View className="flex-row justify-between mb-1">
          {label && <Text className="text-white/70 text-sm">{label}</Text>}
          {showLabel && (
            <Text className="text-hair-gold text-sm font-semibold">{Math.round(clamped)}%</Text>
          )}
        </View>
      )}
      <View className={`w-full ${heightStyles[height]} bg-hair-bg-light rounded-full overflow-hidden`}>
        <View
          className={`h-full ${colorStyles[color]} rounded-full`}
          style={{ width: `${clamped}%` }}
        />
      </View>
    </View>
  );
};
