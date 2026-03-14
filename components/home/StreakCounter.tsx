import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  compact?: boolean;
}

export const StreakCounter = ({ currentStreak, longestStreak, compact = false }: StreakCounterProps) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (currentStreak > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 5 }),
      ]).start();
    }
  }, [currentStreak]);

  const flameEmoji = currentStreak >= 30 ? '🔥🔥🔥' : currentStreak >= 14 ? '🔥🔥' : '🔥';

  if (compact) {
    return (
      <View className="flex-row items-center">
        <Animated.Text style={{ transform: [{ scale: bounceAnim }], fontSize: 22 }}>
          🔥
        </Animated.Text>
        <Text className="text-hair-gold text-lg font-bold ml-1">{currentStreak}</Text>
        <Text className="text-white/60 text-sm ml-1">day streak</Text>
      </View>
    );
  }

  return (
    <View className="bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-white/60 text-sm mb-1">Current Streak</Text>
          <View className="flex-row items-center">
            <Animated.Text style={{ transform: [{ scale: bounceAnim }], fontSize: 36 }}>
              {flameEmoji}
            </Animated.Text>
            <View className="ml-3">
              <Text className="text-white text-3xl font-bold">{currentStreak}</Text>
              <Text className="text-white/60 text-sm">days</Text>
            </View>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-white/60 text-sm mb-1">Best</Text>
          <Text className="text-hair-gold text-2xl font-bold">{longestStreak}</Text>
          <Text className="text-white/60 text-xs">days</Text>
        </View>
      </View>

      {/* Milestone hints */}
      {currentStreak > 0 && currentStreak < 7 && (
        <View className="mt-3 pt-3 border-t border-hair-gold/10">
          <Text className="text-white/50 text-xs text-center">
            {7 - currentStreak} more days to your first week badge! 🏅
          </Text>
        </View>
      )}
      {currentStreak >= 7 && currentStreak < 30 && (
        <View className="mt-3 pt-3 border-t border-hair-gold/10">
          <Text className="text-white/50 text-xs text-center">
            {30 - currentStreak} more days to the 30-day legend badge! 👑
          </Text>
        </View>
      )}
      {currentStreak >= 30 && (
        <View className="mt-3 pt-3 border-t border-hair-gold/10">
          <Text className="text-hair-gold text-xs text-center font-semibold">
            You're a legend! 30+ day streak! 👑
          </Text>
        </View>
      )}
    </View>
  );
};
