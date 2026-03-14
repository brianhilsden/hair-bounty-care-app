import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { Card, CardContent } from '../../../components/ui/Card';
import { Skeleton, SkeletonCard } from '../../../components/ui/Skeleton';
import { StreakCounter } from '../../../components/home/StreakCounter';
import { DailyRoutineCard } from '../../../components/home/DailyRoutineCard';
import { EmptyState } from '../../../components/shared/EmptyState';
import { GoalProgressRing } from '../../../components/shared/GoalProgressRing';
import { routineApi, TodayRoutine } from '../../../lib/api/routine';
import { gamificationApi } from '../../../lib/api/gamification';
import { useState } from 'react';

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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: todayData, isLoading: routinesLoading } = useQuery({
    queryKey: ['routines', 'today'],
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

  const logMutation = useMutation({
    mutationFn: (templateId: string) => routineApi.logRoutine(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines', 'today'] });
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      queryClient.invalidateQueries({ queryKey: ['routine', 'stats'] });
      gamificationApi.checkBadges().then(() => {
        queryClient.invalidateQueries({ queryKey: ['badges', 'me'] });
      });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['routines', 'today'] }),
      queryClient.invalidateQueries({ queryKey: ['streak'] }),
      queryClient.invalidateQueries({ queryKey: ['routine', 'stats'] }),
      queryClient.invalidateQueries({ queryKey: ['badges', 'me'] }),
    ]);
    setRefreshing(false);
  };

  const routines = todayData?.data ?? [];
  const streak = streakData?.data;
  const stats = statsData?.data;
  const badges = badgesData?.data ?? [];

  const completedCount = routines.filter(r => r.completed).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const grouped = groupByCategory(routines);
  const allDone = totalCount > 0 && completedCount === totalCount;

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
          <View className="mx-6 mt-4 bg-hair-gold/10 border border-hair-gold/40 rounded-2xl p-4 items-center">
            <Text className="text-3xl mb-1">🎉</Text>
            <Text className="text-hair-gold font-bold text-base text-center">
              All routines complete for today!
            </Text>
          </View>
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
                    <Text className="text-white/50 text-xs uppercase tracking-widest font-semibold capitalize">
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
                        onComplete={() => logMutation.mutate(routine.id)}
                        isLoading={logMutation.isPending}
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
      </ScrollView>
    </SafeAreaView>
  );
}
