import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '../../../components/ui/Card';
import { Skeleton, SkeletonCard } from '../../../components/ui/Skeleton';
import { StreakCounter } from '../../../components/home/StreakCounter';
import { DailyRoutineCard } from '../../../components/home/DailyRoutineCard';
import { EmptyState } from '../../../components/shared/EmptyState';
import { GoalProgressRing } from '../../../components/shared/GoalProgressRing';
import { routineApi, TodayRoutine, UpcomingRoutine } from '../../../lib/api/routine';
import { gamificationApi } from '../../../lib/api/gamification';
import type { ApiResponse } from '../../../lib/api';
import { useToast } from '../../../components/ui/Toast';

// Sort incomplete first, completed last — preserves stable order within each group
function sortRoutines(routines: TodayRoutine[]): TodayRoutine[] {
  return [...routines].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });
}

// Group routines by category
function groupByCategory(routines: TodayRoutine[]): Record<string, TodayRoutine[]> {
  return routines.reduce<Record<string, TodayRoutine[]>>((acc, routine) => {
    const cat = routine.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(routine);
    return acc;
  }, {});
}

function getMotivationalMessage(completed: number, total: number, streak: number): string {
  if (total === 0) return "Your routines are loading... ✨";
  if (completed === 0) return "Let's get started! Your hair deserves it 💕";
  if (completed === total) {
    if (streak >= 30) return "30+ day streak legend! You're unstoppable 👑";
    if (streak >= 7) return `${streak} days strong! On fire! 🔥`;
    return "All done! You're amazing! ✨";
  }
  const remaining = total - completed;
  return `${remaining} more to go — you've got this! 💪`;
}

export default function RoutinesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: todayData, isLoading: routinesLoading } = useQuery({
    queryKey: ['routine', 'today'],
    queryFn: routineApi.getTodayRoutines,
  });

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: routineApi.getStreak,
  });

  const { data: statsData } = useQuery({
    queryKey: ['routine', 'stats'],
    queryFn: routineApi.getRoutineStats,
  });

  const { data: badgesData } = useQuery({
    queryKey: ['badges', 'me'],
    queryFn: gamificationApi.getUserBadges,
  });

  const { data: upcomingData } = useQuery({
    queryKey: ['routine', 'upcoming'],
    queryFn: routineApi.getUpcomingRoutines,
    staleTime: 60 * 60 * 1000, // 1 hour — next occurrence only changes daily
  });

  const { show: showToast } = useToast();

  const logMutation = useMutation({
    mutationFn: ({ templateId, notes }: { templateId: string; notes?: string }) =>
      routineApi.logRoutine(templateId, notes),

    onMutate: async ({ templateId }) => {
      await queryClient.cancelQueries({ queryKey: ['routine', 'today'] });
      const previous = queryClient.getQueryData<ApiResponse<TodayRoutine[]>>(['routine', 'today']);
      queryClient.setQueryData<ApiResponse<TodayRoutine[]>>(['routine', 'today'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((r) =>
            r.id === templateId ? { ...r, completed: true, completedAt: new Date().toISOString() } : r
          ),
        };
      });
      return { previous };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'stats'] });
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['routine', 'today'], context.previous);
      }
      showToast('Could not log routine. Please try again.', 'error');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['routine', 'today'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: (templateId: string) => routineApi.undoRoutine(templateId),

    onMutate: async (templateId) => {
      await queryClient.cancelQueries({ queryKey: ['routine', 'today'] });
      const previous = queryClient.getQueryData<ApiResponse<TodayRoutine[]>>(['routine', 'today']);
      queryClient.setQueryData<ApiResponse<TodayRoutine[]>>(['routine', 'today'], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((r) =>
            r.id === templateId ? { ...r, completed: false, completedAt: undefined } : r
          ),
        };
      });
      return { previous };
    },

    onError: (_err, _templateId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['routine', 'today'], context.previous);
      }
      showToast('Could not undo routine. Please try again.', 'error');
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['routine', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'stats'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['routine', 'today'] }),
        queryClient.refetchQueries({ queryKey: ['streak'] }),
        queryClient.refetchQueries({ queryKey: ['routine', 'stats'] }),
        queryClient.refetchQueries({ queryKey: ['badges', 'me'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const routines = sortRoutines(todayData?.data ?? []);
  const streak = streakData?.data;
  const stats = statsData?.data;
  const badges = badgesData?.data ?? [];

  const completedCount = routines.filter(r => r.completed).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const grouped = groupByCategory(routines);
  const allDone = totalCount > 0 && completedCount === totalCount;

  // All-done celebration animation
  const celebrationScale = useRef(new Animated.Value(0.85)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationEmoji1Y = useRef(new Animated.Value(0)).current;
  const celebrationEmoji2Y = useRef(new Animated.Value(0)).current;
  const celebrationEmoji3Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!allDone) return;
    // Banner pops in
    Animated.parallel([
      Animated.spring(celebrationScale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 6 }),
      Animated.timing(celebrationOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    // Emojis float up and fade
    const floatEmoji = (anim: Animated.Value, delay: number) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, { toValue: -40, duration: 800, useNativeDriver: true }),
        ]),
      ]);
    Animated.parallel([
      floatEmoji(celebrationEmoji1Y, 100),
      floatEmoji(celebrationEmoji2Y, 250),
      floatEmoji(celebrationEmoji3Y, 400),
    ]).start();
  }, [allDone]);

  const journeyDays = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000) + 1
    : 1;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2994A" />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-2 flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="text-white/60 text-sm mb-1">Day {journeyDays}</Text>
            <Text className="text-3xl font-bold text-white">Daily Routines</Text>
            <Text className="text-white/60 text-sm mt-1">
              {getMotivationalMessage(completedCount, totalCount, streak?.currentStreak ?? 0)}
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/profile/my-routines' as any)}
              className="flex-row items-center mt-2 self-start"
              activeOpacity={0.7}
            >
              <Text className="text-hair-gold text-xs font-semibold">
                {allDone ? '✏️ Add more routines' : '✏️ Edit routines'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Progress ring */}
          <GoalProgressRing
            value={progressPercent}
            size={72}
            strokeWidth={6}
            label={`${completedCount}/${totalCount}`}
            sublabel="done"
          />
        </View>

        {/* All done banner */}
        {allDone && (
          <Animated.View
            style={{ transform: [{ scale: celebrationScale }], opacity: celebrationOpacity }}
            className="mx-6 mt-4 bg-hair-gold/10 border border-hair-gold/40 rounded-2xl p-5 items-center overflow-hidden"
          >
            {/* Floating emoji particles */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="none">
              <Animated.Text style={{ position: 'absolute', left: '20%', top: 20, fontSize: 18, transform: [{ translateY: celebrationEmoji1Y }], opacity: celebrationEmoji1Y.interpolate({ inputRange: [-40, 0], outputRange: [0, 1] }) }}>✨</Animated.Text>
              <Animated.Text style={{ position: 'absolute', left: '50%', top: 10, fontSize: 18, transform: [{ translateY: celebrationEmoji2Y }], opacity: celebrationEmoji2Y.interpolate({ inputRange: [-40, 0], outputRange: [0, 1] }) }}>🌟</Animated.Text>
              <Animated.Text style={{ position: 'absolute', left: '75%', top: 20, fontSize: 18, transform: [{ translateY: celebrationEmoji3Y }], opacity: celebrationEmoji3Y.interpolate({ inputRange: [-40, 0], outputRange: [0, 1] }) }}>💛</Animated.Text>
            </View>
            <Text className="text-4xl mb-2">👑</Text>
            <Text className="text-hair-gold font-bold text-lg text-center mb-1">
              Crown complete!
            </Text>
            <Text className="text-white/60 text-sm text-center">
              All routines done for today. Your hair thanks you 💕
            </Text>
          </Animated.View>
        )}

        {/* Streak */}
        <View className="px-6 mt-5">
          {routinesLoading ? (
            <Skeleton height={100} rounded="lg" />
          ) : streak ? (
            <StreakCounter
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
            />
          ) : null}
        </View>

        {/* Routine list */}
        <View className="px-6 mt-6">
          <Text className="text-white text-xl font-bold mb-4">Today's Tasks</Text>

          {routinesLoading ? (
            <View className="gap-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : routines.length === 0 ? (
            <Card variant="outline">
              <CardContent>
                <EmptyState
                  emoji="🌿"
                  title="No routines yet"
                  description="Your personalized routine plan will appear here once the backend seeds your hair profile data."
                />
              </CardContent>
            </Card>
          ) : (
            <View className="gap-6">
              {Object.entries(grouped).map(([category, items]) => (
                <View key={category}>
                  {/* Category header */}
                  <View className="flex-row items-center mb-3">
                    <Text className="text-white/50 text-xs uppercase tracking-widest font-semibold">
                      {category}
                    </Text>
                    <View className="flex-1 h-px bg-hair-gold/10 ml-3" />
                    <Text className="text-white/40 text-xs ml-3">
                      {items.filter(r => r.completed).length}/{items.length}
                    </Text>
                  </View>

                  <View className="gap-3">
                    {items.map(routine => (
                      <DailyRoutineCard
                        key={routine.id}
                        routine={routine}
                        onComplete={(notes) => logMutation.mutate({ templateId: routine.id, notes })}
                        onUndo={() => undoMutation.mutate(routine.id)}
                        isLoading={logMutation.isPending}
                        isUndoLoading={undoMutation.isPending}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Stats row */}
        {stats && (
          <View className="px-6 mt-6">
            <Text className="text-white text-xl font-bold mb-4">Your Stats</Text>
            <View className="flex-row gap-3">
              {[
                { label: 'Today', value: stats.today },
                { label: 'This Week', value: stats.thisWeek },
                { label: 'This Month', value: stats.thisMonth },
                { label: 'All Time', value: stats.total },
              ].map(item => (
                <View
                  key={item.label}
                  className="flex-1 bg-hair-bg-dark rounded-2xl p-3 items-center border border-hair-gold/10"
                >
                  <Text className="text-hair-gold text-2xl font-bold">{item.value}</Text>
                  <Text className="text-white/50 text-xs mt-1 text-center">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <View className="px-6 mt-6">
            <Text className="text-white text-xl font-bold mb-4">
              Badges Earned 🏅
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-6">
                {badges.map(badge => (
                  <View
                    key={badge.id}
                    className="items-center bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20 w-24"
                  >
                    <Text className="text-3xl mb-2">{badge.iconUrl}</Text>
                    <Text className="text-white text-xs font-semibold text-center" numberOfLines={2}>
                      {badge.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Upcoming routines */}
        {(upcomingData?.data ?? []).length > 0 && (
          <View className="px-6 mt-6 mb-2">
            <View className="flex-row items-center mb-3">
              <Text className="text-white text-xl font-bold">Coming Up 📅</Text>
            </View>
            <View className="gap-3">
              {(upcomingData?.data ?? []).map((routine: UpcomingRoutine) => (
                <View
                  key={routine.id}
                  className="flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-4 border border-white/8"
                >
                  {/* Icon */}
                  <View className="w-12 h-12 rounded-xl bg-white/5 items-center justify-center mr-4">
                    <Text className="text-2xl">{routine.icon}</Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="text-white font-semibold text-sm mb-0.5">
                      {routine.name}
                    </Text>
                    <Text className="text-white/50 text-xs" numberOfLines={1}>
                      {routine.description}
                    </Text>
                  </View>

                  {/* Next label */}
                  <View className="items-end ml-3">
                    <View className={`rounded-full px-2.5 py-1 ${routine.frequency === 'weekly' ? 'bg-blue-500/15 border border-blue-500/25' : 'bg-purple-500/15 border border-purple-500/25'}`}>
                      <Text className={`text-[10px] font-bold uppercase tracking-wide ${routine.frequency === 'weekly' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {routine.frequency}
                      </Text>
                    </View>
                    <Text className="text-white/40 text-xs mt-1">{routine.nextLabel}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
