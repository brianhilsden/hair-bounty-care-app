import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import type { TodayRoutine } from '../../lib/api/routine';

const CATEGORY_COLORS: Record<string, { bg: string; border: string; label: string }> = {
  oiling:     { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   label: 'Oiling' },
  hydrating:  { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    label: 'Hydrating' },
  washing:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30',    label: 'Washing' },
  undoing:    { bg: 'bg-purple-500/10',  border: 'border-purple-500/30',  label: 'Detangling' },
  styling:    { bg: 'bg-pink-500/10',    border: 'border-pink-500/30',    label: 'Styling' },
  protective: { bg: 'bg-green-500/10',   border: 'border-green-500/30',   label: 'Protective' },
  default:    { bg: 'bg-hair-gold/10',   border: 'border-hair-gold/30',   label: 'Care' },
};

const POINTS_PER_ROUTINE = 10;

interface DailyRoutineCardProps {
  routine: TodayRoutine;
  onComplete: () => void;
  isLoading: boolean;
  showPoints?: boolean;
}

export const DailyRoutineCard = ({
  routine,
  onComplete,
  isLoading,
  showPoints = true,
}: DailyRoutineCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;
  const pointsTranslateY = useRef(new Animated.Value(0)).current;

  const colors = CATEGORY_COLORS[routine.category?.toLowerCase()] ?? CATEGORY_COLORS.default;

  const handlePress = () => {
    if (routine.completed || isLoading) return;

    // Scale bounce
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 5 }),
    ]).start();

    // Points float-up animation
    if (showPoints) {
      pointsOpacity.setValue(1);
      pointsTranslateY.setValue(0);
      Animated.parallel([
        Animated.timing(pointsTranslateY, { toValue: -32, duration: 700, useNativeDriver: true }),
        Animated.timing(pointsOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }

    onComplete();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={routine.completed || isLoading}
        activeOpacity={0.85}
        className={`
          rounded-2xl border-2 overflow-hidden
          ${routine.completed
            ? 'border-hair-gold bg-hair-gold/10'
            : `${colors.border} ${colors.bg}`}
        `}
      >
        <View className="p-4 flex-row items-center">
          {/* Icon circle */}
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
              routine.completed ? 'bg-hair-gold/20' : 'bg-black/10'
            }`}
          >
            <Text className="text-3xl">
              {routine.completed ? '✅' : routine.icon}
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text
              className={`text-base font-bold mb-0.5 ${
                routine.completed ? 'text-white/60 line-through' : 'text-white'
              }`}
            >
              {routine.name}
            </Text>
            <Text className="text-white/50 text-xs">{routine.description}</Text>
            <View className="flex-row items-center mt-1.5">
              <View className="bg-black/20 rounded-full px-2 py-0.5">
                <Text className="text-white/50 text-xs capitalize">
                  {colors.label}
                </Text>
              </View>
              {!routine.completed && (
                <Text className="text-hair-gold text-xs font-semibold ml-2">
                  +{POINTS_PER_ROUTINE} pts
                </Text>
              )}
            </View>
          </View>

          {/* Right side */}
          {routine.completed ? (
            <View className="w-8 h-8 rounded-full bg-hair-gold items-center justify-center">
              <Text className="text-white font-bold text-sm">✓</Text>
            </View>
          ) : (
            <View className="w-8 h-8 rounded-full border-2 border-hair-gold/30" />
          )}
        </View>

        {/* Completed timestamp */}
        {routine.completed && routine.completedAt && (
          <View className="px-4 pb-3">
            <Text className="text-white/40 text-xs">
              Done at {new Date(routine.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Floating points */}
      {showPoints && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 16,
            top: 8,
            opacity: pointsOpacity,
            transform: [{ translateY: pointsTranslateY }],
          }}
        >
          <Text className="text-hair-gold font-bold text-base">+{POINTS_PER_ROUTINE}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};
