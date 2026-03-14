import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import type { ViewProps } from 'react-native';

export interface SkeletonProps extends ViewProps {
  width?: number | `${number}%`;
  height?: number;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedStyles = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

export const Skeleton = ({
  width = '100%',
  height = 16,
  rounded = 'md',
  style,
  ...props
}: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: '#5A4A3A',
          borderRadius: roundedStyles[rounded],
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
};

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <View className={`bg-hair-bg-dark rounded-2xl p-4 ${className}`}>
    <Skeleton height={16} width="60%" rounded="md" />
    <View className="mt-3">
      <Skeleton height={12} rounded="sm" />
      <View className="mt-2">
        <Skeleton height={12} width="80%" rounded="sm" />
      </View>
    </View>
  </View>
);
