import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { gamificationApi, LeaderboardEntry } from '../../../lib/api/gamification';
import { Card, CardContent } from '../../../components/ui/Card';
import { Avatar } from '../../../components/ui/Avatar';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/shared/EmptyState';

type Period = 'weekly' | 'all-time';

const RANK_STYLES: Record<number, { bg: string; text: string; emoji: string }> = {
  1: { bg: 'bg-amber-400/20',  text: 'text-amber-400',  emoji: '🥇' },
  2: { bg: 'bg-slate-300/20',  text: 'text-slate-300',  emoji: '🥈' },
  3: { bg: 'bg-amber-700/20',  text: 'text-amber-600',  emoji: '🥉' },
};

function getRankStyle(rank: number) {
  return RANK_STYLES[rank] ?? { bg: 'bg-hair-bg-dark', text: 'text-white/60', emoji: '' };
}

function LeaderboardRow({
  entry,
  isMe,
}: {
  entry: LeaderboardEntry;
  isMe: boolean;
}) {
  const style = getRankStyle(entry.rank);
  const isTop3 = entry.rank <= 3;

  return (
    <View
      className={`
        flex-row items-center px-4 py-3 rounded-2xl mb-2 border
        ${isMe
          ? 'border-hair-gold bg-hair-gold/10'
          : isTop3
          ? `${style.bg} border-transparent`
          : 'border-hair-gold/10 bg-hair-bg-dark'}
      `}
    >
      {/* Rank */}
      <View className="w-10 items-center">
        {isTop3 ? (
          <Text className="text-2xl">{style.emoji}</Text>
        ) : (
          <Text className={`text-base font-bold ${isMe ? 'text-hair-gold' : 'text-white/40'}`}>
            #{entry.rank}
          </Text>
        )}
      </View>

      {/* Avatar */}
      <Avatar
        name={`${entry.firstName} ${entry.lastName}`}
        size="sm"
        className="mx-3"
      />

      {/* Name & stats */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className={`font-semibold text-sm ${isMe ? 'text-hair-gold' : 'text-white'}`}>
            {entry.firstName} {entry.lastName}
            {isMe ? ' (You)' : ''}
          </Text>
          {entry.currentStreak >= 7 && (
            <Text className="ml-2 text-xs">🔥{entry.currentStreak}</Text>
          )}
        </View>
        <Text className="text-white/40 text-xs mt-0.5">
          {entry.routineCount} routines · {entry.badgeCount} badges
        </Text>
      </View>

      {/* Score */}
      <View className="items-end">
        <Text className={`text-lg font-bold ${isMe ? 'text-hair-gold' : isTop3 ? style.text : 'text-white'}`}>
          {entry.score}
        </Text>
        <Text className="text-white/40 text-xs">pts</Text>
      </View>
    </View>
  );
}

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const style = getRankStyle(position);
  const heights = { 1: 'h-24', 2: 'h-16', 3: 'h-12' };
  const order = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };

  return (
    <View className={`flex-1 items-center ${order[position]}`}>
      <Text className="text-3xl mb-1">{style.emoji}</Text>
      <Avatar name={`${entry.firstName} ${entry.lastName}`} size="md" />
      <Text className="text-white text-xs font-semibold mt-1 text-center" numberOfLines={1}>
        {entry.firstName}
      </Text>
      <Text className="text-hair-gold text-xs font-bold">{entry.score} pts</Text>
      <View className={`w-full mt-2 ${heights[position]} ${style.bg} rounded-t-xl items-center justify-center`}>
        <Text className={`text-2xl font-bold ${style.text}`}>#{position}</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [period, setPeriod] = useState<Period>('weekly');
  const [refreshing, setRefreshing] = useState(false);

  const { data: boardData, isLoading: boardLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => gamificationApi.getLeaderboard(period, 50),
  });

  const { data: myRankData } = useQuery({
    queryKey: ['rank', 'me', period],
    queryFn: () => gamificationApi.getUserRank(period),
  });

  const { data: badgesData } = useQuery({
    queryKey: ['badges', 'me'],
    queryFn: gamificationApi.getUserBadges,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['leaderboard', period] }),
      queryClient.invalidateQueries({ queryKey: ['rank', 'me', period] }),
    ]);
    setRefreshing(false);
  };

  const entries = boardData?.data ?? [];
  const myRank = myRankData?.data;
  const badges = badgesData?.data ?? [];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

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
        <View className="px-6 pt-6 pb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/community")} className="mr-4">
            <Text className="text-hair-gold text-base">← Back</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-3xl font-bold text-white">Leaderboard 🏆</Text>
            <Text className="text-white/60 text-sm">Top hair care champions</Text>
          </View>
        </View>

        {/* Period toggle */}
        <View className="px-6 mb-6">
          <View className="flex-row bg-hair-bg-dark rounded-2xl p-1 border border-hair-gold/20">
            {(['weekly', 'all-time'] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 py-2.5 rounded-xl items-center ${
                  period === p ? 'bg-hair-gold' : 'bg-transparent'
                }`}
              >
                <Text className={`text-sm font-semibold capitalize ${
                  period === p ? 'text-white' : 'text-white/50'
                }`}>
                  {p === 'weekly' ? 'This Week' : 'All Time'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My rank banner */}
        {myRank && (
          <View className="mx-6 mb-6 bg-hair-gold/10 border border-hair-gold/30 rounded-2xl p-4">
            <Text className="text-white/60 text-xs mb-1 text-center">Your Ranking</Text>
            <View className="flex-row items-center justify-center gap-6">
              <View className="items-center">
                <Text className="text-hair-gold text-3xl font-bold">#{myRank.rank ?? '—'}</Text>
                <Text className="text-white/50 text-xs">Rank</Text>
              </View>
              <View className="w-px h-10 bg-hair-gold/20" />
              <View className="items-center">
                <Text className="text-white text-3xl font-bold">{myRank.score}</Text>
                <Text className="text-white/50 text-xs">Points</Text>
              </View>
              <View className="w-px h-10 bg-hair-gold/20" />
              <View className="items-center">
                <Text className="text-white text-3xl font-bold">{myRank.currentStreak}</Text>
                <Text className="text-white/50 text-xs">Streak 🔥</Text>
              </View>
            </View>
          </View>
        )}

        {/* Podium — top 3 */}
        {!boardLoading && top3.length === 3 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-end gap-2">
              {([2, 1, 3] as const).map((pos) => (
                <PodiumCard key={pos} entry={top3[pos - 1]} position={pos} />
              ))}
            </View>
          </View>
        )}

        {/* Full list */}
        <View className="px-6">
          <Text className="text-white text-base font-bold mb-3 text-white/60 uppercase tracking-widest text-xs">
            Rankings
          </Text>

          {boardLoading ? (
            <View className="gap-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} height={64} rounded="lg" />
              ))}
            </View>
          ) : entries.length === 0 ? (
            <Card variant="outline">
              <CardContent>
                <EmptyState
                  emoji="🏆"
                  title="No rankings yet"
                  description="Complete your daily routines to appear on the leaderboard!"
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {entries.map((entry) => (
                <LeaderboardRow
                  key={entry.userId}
                  entry={entry}
                  isMe={entry.userId === user?.id}
                />
              ))}
            </>
          )}
        </View>

        {/* Badges showcase */}
        {badges.length > 0 && (
          <View className="px-6 mt-8">
            <Text className="text-white text-xl font-bold mb-4">Your Badges 🏅</Text>
            <View className="flex-row flex-wrap gap-3">
              {badges.map((badge) => (
                <View
                  key={badge.id}
                  className="items-center bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20 w-24"
                >
                  <Text className="text-3xl mb-2">{badge.iconUrl}</Text>
                  <Text className="text-white text-xs font-semibold text-center" numberOfLines={2}>
                    {badge.name}
                  </Text>
                  {badge.earnedAt && (
                    <Text className="text-white/30 text-xs mt-1">
                      {new Date(badge.earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
