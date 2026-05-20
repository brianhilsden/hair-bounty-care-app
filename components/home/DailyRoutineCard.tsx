import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, TextInput, Alert } from 'react-native';
import type { TodayRoutine } from '../../lib/api/routine';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';

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
  onComplete: (notes?: string) => void;
  onUndo: () => void;
  isLoading: boolean;
  isUndoLoading: boolean;
  showPoints?: boolean;
}

export const DailyRoutineCard = ({
  routine,
  onComplete,
  onUndo,
  isLoading,
  isUndoLoading,
  showPoints = true,
}: DailyRoutineCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pointsOpacity = useRef(new Animated.Value(0)).current;
  const pointsTranslateY = useRef(new Animated.Value(0)).current;
  const [notesSheet, setNotesSheet] = useState(false);
  const [note, setNote] = useState('');

  const colors = CATEGORY_COLORS[routine.category?.toLowerCase()] ?? CATEGORY_COLORS.default;

  const handlePress = () => {
    if (routine.completed || isLoading) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 5 }),
    ]).start();

    if (showPoints) {
      pointsOpacity.setValue(1);
      pointsTranslateY.setValue(0);
      Animated.parallel([
        Animated.timing(pointsTranslateY, { toValue: -32, duration: 700, useNativeDriver: true }),
        Animated.timing(pointsOpacity, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }

    setNote('');
    setNotesSheet(true);
  };

  const handleLongPress = () => {
    if (!routine.completed || isUndoLoading) return;
    Alert.alert(
      'Mark as incomplete?',
      `This will undo "${routine.name}" for today.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Undo', style: 'destructive', onPress: onUndo },
      ]
    );
  };

  const handleCompleteWithNote = (withNote: boolean) => {
    setNotesSheet(false);
    onComplete(withNote && note.trim() ? note.trim() : undefined);
    setNote('');
  };

  return (
    <>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={400}
          disabled={(routine.completed && isUndoLoading) || (!routine.completed && isLoading)}
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
              <Text className="text-white/50 text-xs" numberOfLines={1}>{routine.description}</Text>
              <View className="flex-row items-center mt-1.5 gap-2">
                <View className="bg-black/20 rounded-full px-2 py-0.5">
                  <Text className="text-white/50 text-xs capitalize">
                    {colors.label}
                  </Text>
                </View>
                {!routine.completed && routine.estimatedMinutes > 0 && (
                  <View className="bg-black/20 rounded-full px-2 py-0.5">
                    <Text className="text-white/40 text-xs">⏱ {routine.estimatedMinutes} min</Text>
                  </View>
                )}
                {!routine.completed && (
                  <Text className="text-hair-gold text-xs font-semibold">
                    +{POINTS_PER_ROUTINE} pts
                  </Text>
                )}
                {routine.completed && (
                  <Text className="text-white/30 text-xs">Hold to undo</Text>
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

      {/* Notes bottom sheet */}
      <BottomSheet
        visible={notesSheet}
        onClose={() => setNotesSheet(false)}
        title={`${routine.icon} ${routine.name}`}
        snapHeight={340}
      >
        <View className="flex-1">
          <Text className="text-white/60 text-sm mb-3">
            How did it go? Add a note (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="e.g. Used shea butter, hair felt great..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            multiline
            numberOfLines={4}
            maxLength={200}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              borderColor: 'rgba(210,153,74,0.2)',
              borderRadius: 16,
              padding: 14,
              color: '#fff',
              fontSize: 14,
              textAlignVertical: 'top',
              minHeight: 100,
              marginBottom: 16,
            }}
          />
          <View className="gap-3">
            <Button variant="primary" size="lg" onPress={() => handleCompleteWithNote(true)}>
              Complete ✓
            </Button>
            <TouchableOpacity onPress={() => handleCompleteWithNote(false)} className="items-center py-2">
              <Text className="text-white/40 text-sm">Skip note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </>
  );
};
