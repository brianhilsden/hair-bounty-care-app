import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface GoalProgressRingProps {
  value: number;       // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const GoalProgressRing = ({
  value,
  size = 100,
  strokeWidth = 8,
  label,
  sublabel,
}: GoalProgressRingProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#5A4A3A"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#D2994A"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View className="items-center">
        {label && (
          <Text className="text-white font-bold" style={{ fontSize: size * 0.18 }}>
            {label}
          </Text>
        )}
        {sublabel && (
          <Text className="text-white/60" style={{ fontSize: size * 0.11 }}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
};
