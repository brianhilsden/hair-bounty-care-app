/**
 * HOME DASHBOARD - Phase 3 (Minimal)
 *
 * TODO: Complete in later phases with full dashboard structure:
 *
 * 1. ✅ Header Section (personalized greeting, journey day, streak indicator)
 * 2. ✅ Quick Stats Card (streak, routines today, recent badge, rank)
 * 3. ✅ Today's Routine Section (compact view with "View All" button)
 * 4. 🔲 Progress Snapshot (Phase 4 - before/after photos, growth metrics)
 * 5. ✅ Personalized Recommendations (horizontal scroll - hairstyles, products, DIY recipes)
 * 6. ✅ Community Highlights (Phase 5 - recent posts, trending transformations)
 * 7. ✅ Explore section (Dynamic banner)
 * 8. 🔲 Ads Banner (non-intrusive sponsored content)
 */

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { routineApi } from "../../../lib/api/routine";
import { gamificationApi } from "../../../lib/api/gamification";
import { progressApi } from "../../../lib/api/progress";
import { recommendationsApi } from "../../../lib/api/recommendations";
import { communityApi } from "../../../lib/api/community";
import { Skeleton } from "../../../components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch streak
  const { data: streakData } = useQuery({
    queryKey: ["streak"],
    queryFn: routineApi.getStreak,
  });

  // Fetch routine stats
  const { data: statsData } = useQuery({
    queryKey: ["routine", "stats"],
    queryFn: routineApi.getRoutineStats,
  });

  // Fetch user badges
  const { data: badgesData } = useQuery({
    queryKey: ["badges", "me"],
    queryFn: gamificationApi.getUserBadges,
  });

  // Fetch user rank
  const { data: rankData } = useQuery({
    queryKey: ["rank", "me"],
    queryFn: () => gamificationApi.getUserRank("all-time"),
  });

  // Fetch progress comparison
  const { data: progressComparisonData } = useQuery({
    queryKey: ["progress", "comparison"],
    queryFn: progressApi.getBeforeAfterComparison,
  });

  // Fetch growth stats
  const { data: growthStatsData } = useQuery({
    queryKey: ["progress", "stats"],
    queryFn: progressApi.getGrowthStats,
  });

  // Fetch recommendations
  const { data: recsData, isLoading: recsLoading } = useQuery({
    queryKey: ["recommendations", "products", "home"],
    queryFn: () => recommendationsApi.getProducts(),
  });

  // Fetch community
  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ["community", "groups", "home"],
    queryFn: () => communityApi.getGroups(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["streak"] }),
      queryClient.invalidateQueries({ queryKey: ["routine", "stats"] }),
      queryClient.invalidateQueries({ queryKey: ["badges", "me"] }),
      queryClient.invalidateQueries({ queryKey: ["rank", "me"] }),
      queryClient.invalidateQueries({ queryKey: ["progress"] }),
      queryClient.invalidateQueries({
        queryKey: ["recommendations", "products", "home"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["community", "groups", "home"],
      }),
    ]);
    setRefreshing(false);
  };

  const streak = streakData?.data;
  const stats = statsData?.data;
  const badges = badgesData?.data || [];
  const rank = rankData?.data;

  // Calculate days in journey (since account creation)
  const journeyDays = user?.createdAt
    ? Math.floor(
        (new Date().getTime() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    : 1;

  const recentBadge = badges.length > 0 ? badges[0] : null;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D2994A"
          />
        }
      >
        {/* Header Section */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-bold text-white mb-1">
            Hey {user?.firstName}! 👋
          </Text>
          <Text className="text-white/70 text-base">
            Day {journeyDays} of your hair journey
          </Text>
          {streak && streak.currentStreak > 0 && (
            <View className="flex-row items-center mt-2">
              <Text className="text-2xl mr-2">🔥</Text>
              <Text className="text-hair-gold text-lg font-bold">
                {streak.currentStreak} day streak
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats Card */}
        <View className="px-6 mb-6">
          <Card
            variant="elevated"
            className="bg-gradient-to-br from-hair-gold/20 to-hair-gold/5"
          >
            <CardContent>
              <Text className="text-white text-lg font-bold mb-4">
                Quick Stats
              </Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">🔥</Text>
                    <Text className="text-white/70 text-base">
                      Current Streak
                    </Text>
                  </View>
                  <Text className="text-white text-xl font-bold">
                    {streak?.currentStreak || 0} {streak?.currentStreak === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-3">✅</Text>
                    <Text className="text-white/70 text-base">
                      Routines Today
                    </Text>
                  </View>
                  <Text className="text-white text-xl font-bold">
                    {stats?.today || 0}
                  </Text>
                </View>

                {recentBadge && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">
                        {recentBadge.iconUrl}
                      </Text>
                      <Text className="text-white/70 text-base">
                        Recent Badge
                      </Text>
                    </View>
                    <Text className="text-white text-sm font-semibold">
                      {recentBadge.name}
                    </Text>
                  </View>
                )}

                {rank?.rank && (
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="text-2xl mr-3">🏆</Text>
                      <Text className="text-white/70 text-base">
                        Leaderboard Rank
                      </Text>
                    </View>
                    <Text className="text-hair-gold text-xl font-bold">
                      #{rank.rank}
                    </Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Today's Routine Section - Compact */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-xl font-bold">
              Today's Routine
            </Text>
            <TouchableOpacity onPress={() => router.push("/home/routines")}>
              <Text className="text-hair-gold text-sm font-semibold">
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          <Card variant="default">
            <CardContent>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-white text-base mb-1">
                    {stats?.today || 0} routines completed today
                  </Text>
                  <Text className="text-white/60 text-sm">
                    Keep up the great work! 💪
                  </Text>
                </View>
                <View className="w-16 h-16 rounded-full bg-hair-gold/20 items-center justify-center">
                  <Text className="text-3xl">✨</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Progress Snapshot */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-xl font-bold">
              Progress Snapshot
            </Text>
            <TouchableOpacity onPress={() => router.push("/home/progress")}>
              <Text className="text-hair-gold text-sm font-semibold">
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {progressComparisonData?.data ? (
            <Card variant="default">
              <CardContent>
                <View className="flex-row gap-3 mb-3">
                  <View className="flex-1">
                    <Text className="text-white/60 text-xs mb-2 text-center">
                      Before
                    </Text>
                    <Image
                      source={{
                        uri: progressComparisonData.data.before.photoUrl,
                      }}
                      className="w-full h-32 rounded-xl"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white/60 text-xs mb-2 text-center">
                      After
                    </Text>
                    <Image
                      source={{
                        uri: progressComparisonData.data.after.photoUrl,
                      }}
                      className="w-full h-32 rounded-xl"
                      resizeMode="cover"
                    />
                  </View>
                </View>
                {growthStatsData?.data?.totalGrowth ? (
                  <View className="bg-hair-gold/10 p-3 rounded-xl border border-hair-gold/30">
                    <Text className="text-hair-gold text-center text-sm font-semibold">
                      +{growthStatsData.data.totalGrowth} cm growth in{" "}
                      {growthStatsData.data.journeyDays} days
                    </Text>
                  </View>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push("/home/progress")}
                  className="mt-3"
                >
                  View Full Timeline →
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outline">
              <CardContent>
                <View className="items-center py-4">
                  <Text className="text-5xl mb-3">📸</Text>
                  <Text className="text-white text-lg font-semibold mb-2">
                    Start Tracking
                  </Text>
                  <Text className="text-white/60 text-sm text-center mb-4">
                    Take your first progress photo to see your transformation
                  </Text>
                  <Button
                    variant="primary"
                    size="md"
                    onPress={() => router.push("/home/progress")}
                  >
                    Add Photo
                  </Button>
                </View>
              </CardContent>
            </Card>
          )}
        </View>

        {/* Personalized Recommendations */}
        <View className="mb-6">
          <View className="px-6 flex-row items-center justify-between mb-3">
            <Text className="text-white text-xl font-bold">For You ✨</Text>
            <TouchableOpacity onPress={() => router.push("/explore" as any)}>
              <Text className="text-hair-gold text-sm font-semibold">
                More →
              </Text>
            </TouchableOpacity>
          </View>
          {recsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {[0, 1].map((i) => (
                <Skeleton key={i} height={140} width={220} rounded="lg" />
              ))}
            </ScrollView>
          ) : recsData?.data && recsData.data.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {recsData.data.slice(0, 3).map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  onPress={() =>
                    router.push(`/explore/products/${rec.id}` as any)
                  }
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["rgba(210, 153, 74, 0.15)", "rgba(30,30,30,0.8)"]}
                    className="w-56 rounded-3xl p-4 border border-hair-gold/20 mr-2"
                  >
                    <View className="flex-row items-start mb-3">
                      <View className="w-12 h-12 bg-hair-gold/20 rounded-full items-center justify-center mr-3">
                        <Text className="text-2xl">🧴</Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-white font-bold text-sm"
                          numberOfLines={2}
                        >
                          {rec.name}
                        </Text>
                        <Text className="text-hair-gold text-xs font-semibold mt-1">
                          {rec.brand}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View className="px-6">
              <TouchableOpacity
                onPress={() => router.push("/(onboarding)/quiz" as any)}
                className="bg-hair-bg-dark rounded-3xl p-5 items-center border border-hair-gold/30"
              >
                <Text className="text-4xl mb-2">🎯</Text>
                <Text className="text-white font-semibold mb-1">
                  Complete your profile
                </Text>
                <Text className="text-white/60 text-sm mb-3">
                  Get personalized product picks
                </Text>
                <View className="bg-hair-gold px-4 py-2 rounded-full">
                  <Text className="text-black font-bold text-xs uppercase">
                    Take Quiz
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Community Highlights */}
        <View className="mb-6">
          <View className="px-6 flex-row items-center justify-between mb-3">
            <Text className="text-white text-xl font-bold">Community 👥</Text>
            <TouchableOpacity onPress={() => router.push("/community")}>
              <Text className="text-hair-gold text-sm font-semibold">
                Join →
              </Text>
            </TouchableOpacity>
          </View>
          {communityLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={200} width={130} rounded="lg" />
              ))}
            </ScrollView>
          ) : communityData?.data && communityData.data.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {communityData.data.slice(0, 3).map((group) => (
                <TouchableOpacity
                  key={group.id}
                  onPress={() =>
                    router.push(`/community/groups/${group.id}` as any)
                  }
                  activeOpacity={0.9}
                >
                  <View className="w-72 h-40 rounded-3xl overflow-hidden border border-hair-gold/30">
                    <Image
                      source={{
                        uri:
                          group.coverUrl ||
                          "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=800",
                      }}
                      className="absolute inset-0 w-full h-full"
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={[
                        "rgba(0,0,0,0.1)",
                        "rgba(0,0,0,0.8)",
                        "rgba(0,0,0,1)",
                      ]}
                      className="absolute inset-0"
                    />
                    <View className="p-5 flex-1 justify-between">
                      <View className="self-end bg-black/60 px-3 py-1 rounded-full border border-white/10">
                        <Text className="text-hair-gold text-[10px] font-bold uppercase tracking-wider">
                          {group.category}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-white text-lg font-bold mb-1">
                          {group.name}
                        </Text>
                        <Text className="text-white/70 text-xs">
                          � {group.memberCount} members
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* Interactive Explore Banner */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/explore")}
          >
            <LinearGradient
              colors={["#1A1814", "#2A261F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-3xl p-6 border border-hair-gold/30 items-center justify-between flex-row"
            >
              <View className="flex-1 mr-4">
                <Text className="text-white text-xl font-bold mb-1">
                  Discover more
                </Text>
                <Text className="text-white/60 text-sm">
                  Find top tier salons, products & expert hair tips near you.
                </Text>
              </View>
              <View className="w-14 h-14 bg-hair-gold rounded-full items-center justify-center">
                <Text className="text-2xl">🔍</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Motivational Footer */}
        <View className="px-6">
          <Card variant="outline" className="border-hair-gold/10 bg-white/5">
            <CardContent>
              <Text className="text-hair-gold text-center text-sm font-semibold italic">
                "Your hair journey is unique. Embrace every step! 🌟"
              </Text>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
