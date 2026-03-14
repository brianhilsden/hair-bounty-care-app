import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { gamificationApi } from '../../../lib/api/gamification';
import { StreakCounter } from '../../../components/home/StreakCounter';
import { routineApi } from '../../../lib/api/routine';
import { communityApi } from '../../../lib/api/community';
import { reviewsApi } from '../../../lib/api/reviews';

export default function CommunityScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: myRankData } = useQuery({
    queryKey: ['rank', 'me', 'weekly'],
    queryFn: () => gamificationApi.getUserRank('weekly'),
  });

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: routineApi.getStreak,
  });

  const { data: badgesData } = useQuery({
    queryKey: ['badges', 'me'],
    queryFn: gamificationApi.getUserBadges,
  });

  const { data: groupsData } = useQuery({
    queryKey: ['community', 'groups'],
    queryFn: communityApi.getGroups,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'all'],
    queryFn: () => reviewsApi.getReviews({ limit: 3 }),
  });

  const myRank = myRankData?.data;
  const streak = streakData?.data;
  const badges = badgesData?.data ?? [];
  const groups = groupsData?.data?.slice(0, 3) ?? [];
  const recentReviews = reviewsData?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-white mb-1">Community 👥</Text>
          <Text className="text-white/60 text-base">Connect, share & inspire</Text>
        </View>

        {/* Leaderboard entry point — real, not a placeholder */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/community/leaderboard')}
            activeOpacity={0.85}
          >
            <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/30 p-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-bold">Leaderboard 🏆</Text>
                <Text className="text-hair-gold text-sm font-semibold">View All →</Text>
              </View>

              {myRank ? (
                <View className="flex-row gap-4">
                  <View className="flex-1 bg-hair-gold/10 rounded-xl p-3 items-center">
                    <Text className="text-hair-gold text-2xl font-bold">#{myRank.rank ?? '—'}</Text>
                    <Text className="text-white/50 text-xs mt-1">Your Rank</Text>
                  </View>
                  <View className="flex-1 bg-hair-bg-light rounded-xl p-3 items-center">
                    <Text className="text-white text-2xl font-bold">{myRank.score}</Text>
                    <Text className="text-white/50 text-xs mt-1">Points</Text>
                  </View>
                  <View className="flex-1 bg-hair-bg-light rounded-xl p-3 items-center">
                    <Text className="text-white text-2xl font-bold">{myRank.badgeCount}</Text>
                    <Text className="text-white/50 text-xs mt-1">Badges</Text>
                  </View>
                </View>
              ) : (
                <View className="items-center py-2">
                  <Text className="text-white/50 text-sm">Complete routines to rank up!</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak */}
        {streak && (
          <View className="px-6 mb-6">
            <StreakCounter
              currentStreak={streak.currentStreak}
              longestStreak={streak.longestStreak}
            />
          </View>
        )}

        {/* Badges preview */}
        {badges.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Your Badges 🏅</Text>
              <TouchableOpacity onPress={() => router.push('/community/leaderboard')}>
                <Text className="text-hair-gold text-sm font-semibold">See All →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-3 pr-6">
                {badges.slice(0, 8).map((badge) => (
                  <View
                    key={badge.id}
                    className="items-center bg-hair-bg-dark rounded-2xl p-3 border border-hair-gold/20 w-20"
                  >
                    <Text className="text-3xl mb-1">{badge.iconUrl}</Text>
                    <Text className="text-white text-xs font-semibold text-center" numberOfLines={2}>
                      {badge.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Hair Groups */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">Hair Groups 🌿</Text>
            <TouchableOpacity onPress={() => router.push('/community/groups')}>
              <Text className="text-hair-gold text-sm font-semibold">See All →</Text>
            </TouchableOpacity>
          </View>

          {groups.length > 0 ? (
            <View className="gap-3">
              {groups.map(group => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() => router.push(`/community/groups/${group.id}`)}
                  activeOpacity={0.85}
                >
                  <View className="bg-hair-bg-dark rounded-2xl px-4 py-3.5 border border-hair-gold/10 flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-hair-gold/20 items-center justify-center mr-3">
                      <Text className="text-xl">🌿</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold text-sm" numberOfLines={1}>{group.name}</Text>
                      <Text className="text-white/40 text-xs">{group.memberCount.toLocaleString()} members</Text>
                    </View>
                    {group.isJoined && (
                      <View className="bg-hair-gold/20 rounded-full px-2 py-0.5">
                        <Text className="text-hair-gold text-xs font-semibold">Joined</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => router.push('/community/groups')}
                className="bg-hair-bg-dark rounded-2xl py-3 items-center border border-hair-gold/10"
              >
                <Text className="text-hair-gold text-sm font-semibold">Browse All Groups →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/community/groups')}
              activeOpacity={0.85}
              className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/20 items-center"
            >
              <Text className="text-5xl mb-3">🌿</Text>
              <Text className="text-white font-semibold mb-1">Find Your Hair Tribe</Text>
              <Text className="text-white/50 text-sm text-center mb-3">
                Join groups for Braids, Locs, Natural Curls & more
              </Text>
              <Text className="text-hair-gold text-sm font-semibold">Explore Groups →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Community Reviews */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">Reviews ⭐</Text>
            <TouchableOpacity onPress={() => router.push('/community/reviews')}>
              <Text className="text-hair-gold text-sm font-semibold">See All →</Text>
            </TouchableOpacity>
          </View>

          {recentReviews.length > 0 ? (
            <View className="gap-3">
              {recentReviews.map(review => (
                <View key={review.id} className="bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/10">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white font-semibold text-sm">
                      {review.user.firstName} {review.user.lastName[0]}.
                    </Text>
                    <View className="flex-row gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Text key={s} style={{ fontSize: 11 }}>{s <= review.rating ? '⭐' : '☆'}</Text>
                      ))}
                    </View>
                  </View>
                  <Text className="text-white/70 text-sm leading-5" numberOfLines={2}>{review.content}</Text>
                </View>
              ))}
              <TouchableOpacity
                onPress={() => router.push('/community/reviews')}
                className="bg-hair-bg-dark rounded-2xl py-3 items-center border border-hair-gold/10"
              >
                <Text className="text-hair-gold text-sm font-semibold">Read All Reviews →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/community/reviews')}
              activeOpacity={0.85}
              className="bg-hair-bg-dark rounded-2xl p-5 border border-hair-gold/20 items-center"
            >
              <Text className="text-5xl mb-3">⭐</Text>
              <Text className="text-white font-semibold mb-1">Community Reviews</Text>
              <Text className="text-white/50 text-sm text-center mb-3">
                Honest reviews of products, salons & hair tips
              </Text>
              <Text className="text-hair-gold text-sm font-semibold">Browse Reviews →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
