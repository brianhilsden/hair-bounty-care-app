
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/authStore";
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

  // Realtime: refetch every tab focus — streak and today's routines change as user acts
  const { data: streakData, isError: streakError } = useQuery({
    queryKey: ["streak"],
    queryFn: routineApi.getStreak,
    staleTime: 60 * 1000,
  });

  const { data: statsData, isError: statsError } = useQuery({
    queryKey: ["routine", "stats"],
    queryFn: routineApi.getRoutineStats,
    staleTime: 60 * 1000,
  });

  const { data: todayRoutinesData, isError: routinesError } = useQuery({
    queryKey: ["routine", "today"],
    queryFn: routineApi.getTodayRoutines,
    staleTime: 30 * 1000,
  });

  // Semi-realtime: changes happen but not every minute
  const { data: badgesData } = useQuery({
    queryKey: ["badges", "me"],
    queryFn: gamificationApi.getUserBadges,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rankData } = useQuery({
    queryKey: ["rank", "me"],
    queryFn: () => gamificationApi.getUserRank("all-time"),
    staleTime: 10 * 60 * 1000,
  });

  const { data: progressComparisonData } = useQuery({
    queryKey: ["progress", "comparison"],
    queryFn: progressApi.getBeforeAfterComparison,
    staleTime: 10 * 60 * 1000,
  });

  const { data: growthStatsData } = useQuery({
    queryKey: ["progress", "stats"],
    queryFn: progressApi.getGrowthStats,
    staleTime: 10 * 60 * 1000,
  });

  // Slow: content changes rarely, no need to refetch on every tab visit
  const { data: recsData, isLoading: recsLoading, isError: recsError } = useQuery({
    queryKey: ["recommendations", "products", "home"],
    queryFn: () => recommendationsApi.getProducts(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: communityData, isLoading: communityLoading, isError: communityError } = useQuery({
    queryKey: ["community", "groups", "home"],
    queryFn: () => communityApi.getGroups(),
    staleTime: 15 * 60 * 1000,
  });

  const hasCriticalError = streakError || statsError || routinesError;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["streak"] }),
        queryClient.refetchQueries({ queryKey: ["routine", "stats"] }),
        queryClient.refetchQueries({ queryKey: ["routine", "today"] }),
        queryClient.refetchQueries({ queryKey: ["badges", "me"] }),
        queryClient.refetchQueries({ queryKey: ["rank", "me"] }),
        queryClient.refetchQueries({ queryKey: ["progress"] }),
        queryClient.refetchQueries({ queryKey: ["recommendations", "products", "home"] }),
        queryClient.refetchQueries({ queryKey: ["community", "groups", "home"] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const streak = streakData?.data;
  const todayRoutines = todayRoutinesData?.data ?? [];
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 17) return "Good afternoon";
    if (hour >= 17 && hour < 21) return "Good evening";
    return "Good night";
  };

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
        {/* ── HERO HEADER ── */}
        <View className="mx-4 mt-4 mb-4 rounded-3xl overflow-hidden" style={{ height: 200 }}>
          <ImageBackground
            source={{ uri: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80" }}
            style={{ flex: 1 }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(63,45,37,0.35)", "rgba(20,13,10,0.92)"]}
              style={{ flex: 1, padding: 24, justifyContent: "flex-end" }}
            >
              <View className="flex-row items-center mb-1">
                <Text className="text-white/70 text-sm">Day {journeyDays} of your journey  •  </Text>
                {streak && streak.currentStreak > 0 ? (
                  <Text className="text-hair-gold text-sm font-bold">🔥 {streak.currentStreak} day streak</Text>
                ) : (
                  <Text className="text-white/50 text-sm">Start your streak today</Text>
                )}
              </View>
              <Text className="text-white text-3xl font-bold">
                {getGreeting()}, {user?.firstName}! 👋
              </Text>
              <Text className="text-white/60 text-sm mt-1">
                Ready for today's hair care routine?
              </Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* ── NETWORK ERROR BANNER ── */}
        {hasCriticalError && (
          <TouchableOpacity
            onPress={() => queryClient.refetchQueries({ queryKey: ["routine"] })}
            style={{
              marginHorizontal: 16,
              marginBottom: 12,
              backgroundColor: "rgba(239,68,68,0.12)",
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.3)",
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" }}>
                Couldn't load some data
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2 }}>
                Check your connection · Tap to retry
              </Text>
            </View>
            <Text style={{ color: "#D2994A", fontSize: 12, fontWeight: "700" }}>Retry →</Text>
          </TouchableOpacity>
        )}

        {/* ── OPTION B: Featured card + 2 small cards ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20, gap: 12 }}>

          {/* PRIMARY — Today's Routine (full width, tall) */}
          <TouchableOpacity activeOpacity={0.88} onPress={() => router.push("/home/routines")} style={{ borderRadius: 24, overflow: "hidden" }}>
            <Image
              source={require("../../../assets/images/hair_routine.jpg")}
              style={{ position: "absolute", top: -30, left: 0, right: 0, bottom: 0, width: "100%", height: "130%" }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.2)", "rgba(10,6,3,0.96)"]}
              locations={[0, 0.35, 1]}
              style={{ padding: 20, paddingTop: 18 }}
            >
                {/* Top row */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <View style={{ backgroundColor: "#D2994A", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700", letterSpacing: 0.6 }}>TODAY'S ROUTINE</Text>
                  </View>
                  <View style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" }}>
                    <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "600" }}>
                      {stats?.today || 0}/{todayRoutines.length || "—"} done
                    </Text>
                  </View>
                </View>

                {/* Routine items list */}
                {todayRoutines.length > 0 ? (
                  <View style={{ gap: 10, marginBottom: 16 }}>
                    {todayRoutines.slice(0, 3).map((r) => (
                      <View key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <View style={{
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: r.completed ? "#D2994A" : "rgba(255,255,255,0.1)",
                          borderWidth: 1.5,
                          borderColor: r.completed ? "#D2994A" : "rgba(255,255,255,0.25)",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <Text style={{ fontSize: 12 }}>{r.completed ? "✓" : r.icon}</Text>
                        </View>
                        <Text style={{
                          color: r.completed ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)",
                          fontSize: 14,
                          fontWeight: "600",
                          textDecorationLine: r.completed ? "line-through" : "none",
                          flex: 1,
                        }}>
                          {r.name}
                        </Text>
                        {r.completed && (
                          <Text style={{ color: "#D2994A", fontSize: 11, fontWeight: "600" }}>Done</Text>
                        )}
                      </View>
                    ))}
                    {todayRoutines.length > 3 && (
                      <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>
                        +{todayRoutines.length - 3} more
                      </Text>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.push("/profile/my-routines" as any)}
                    style={{
                      marginBottom: 16,
                      borderWidth: 1.5,
                      borderColor: "rgba(210,153,74,0.35)",
                      borderStyle: "dashed",
                      borderRadius: 16,
                      padding: 16,
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: "rgba(210,153,74,0.06)",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>💆‍♀️</Text>
                    <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "700", textAlign: "center" }}>
                      No routines set up yet
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center", lineHeight: 18 }}>
                      Build your personalized daily routine{"\n"}and start your hair care journey
                    </Text>
                    <View style={{
                      marginTop: 4,
                      backgroundColor: "#D2994A",
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 7,
                    }}>
                      <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
                        Choose My Routines →
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* CTA */}
                {todayRoutines.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ color: "#D2994A", fontSize: 13, fontWeight: "700" }}>
                    View & complete all
                  </Text>
                  <Text style={{ color: "#D2994A", fontSize: 13 }}>→</Text>
                </View>
                )}
              </LinearGradient>
          </TouchableOpacity>

          {/* SECONDARY ROW — Progress + Discover side by side */}
          <View style={{ flexDirection: "row", gap: 12 }}>

            {/* Track Progress */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/home/progress")}
              style={{ flex: 1, borderRadius: 20, overflow: "hidden", height: 150, backgroundColor: "#1a1a1a" }}
            >
              {/* Image fills height, centered horizontally so both Before & After faces show */}
              <Image
                source={require("../../../assets/images/hair_growth_before_after.png")}
                style={{ position: "absolute", top: 0, left: "50%", transform: [{ translateX: -75 }], width: 150, height: 150 }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["rgba(0,0,0,0.05)", "rgba(5,20,15,0.88)"]}
                style={{ flex: 1, padding: 16, justifyContent: "space-between" }}
              >
                <View style={{ backgroundColor: "rgba(95,185,154,0.25)", alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(95,185,154,0.4)" }}>
                  <Text style={{ color: "#5FB99A", fontSize: 10, fontWeight: "700" }}>PROGRESS</Text>
                </View>
                <View>
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", marginBottom: 3 }}>
                    {growthStatsData?.data?.totalGrowth ? `+${growthStatsData.data.totalGrowth} cm` : "Track growth"}
                  </Text>
                  <Text style={{ color: "#5FB99A", fontSize: 11, fontWeight: "600" }}>See timeline →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Discover */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/explore" as any)}
              style={{ flex: 1, borderRadius: 20, overflow: "hidden", height: 150 }}
            >
              <ImageBackground
                source={{ uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80" }}
                style={{ flex: 1 }}
                resizeMode="cover"
              >
                <LinearGradient
                  colors={["rgba(0,0,0,0.05)", "rgba(20,10,30,0.88)"]}
                  style={{ flex: 1, padding: 16, justifyContent: "space-between" }}
                >
                  <View style={{ backgroundColor: "rgba(167,139,250,0.25)", alignSelf: "flex-start", borderRadius: 16, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(167,139,250,0.4)" }}>
                    <Text style={{ color: "#A78BFA", fontSize: 10, fontWeight: "700" }}>DISCOVER</Text>
                  </View>
                  <View>
                    <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800", marginBottom: 3 }}>
                      Salons & products
                    </Text>
                    <Text style={{ color: "#A78BFA", fontSize: 11, fontWeight: "600" }}>Browse now →</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

          </View>
        </View>

        {/* ── QUICK STATS GRID ── */}
        <View className="px-4 mb-5">
          <LinearGradient
            colors={["#2A1F1A", "#1A1310"]}
            className="rounded-3xl p-5 border border-hair-gold/20"
          >
            <Text className="text-white text-base font-bold mb-4">Your Stats</Text>
            <View className="flex-row gap-3">
              {/* Streak */}
              <View className="flex-1 bg-hair-gold/10 rounded-2xl p-4 border border-hair-gold/20 items-center">
                <Text className="text-3xl mb-1">🔥</Text>
                <Text className="text-hair-gold text-xl font-bold">{streak?.currentStreak || 0}</Text>
                <Text className="text-white/50 text-xs mt-0.5">Day streak</Text>
              </View>
              {/* Routines */}
              <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 items-center">
                <Text className="text-3xl mb-1">✅</Text>
                <Text className="text-white text-xl font-bold">{stats?.today || 0}</Text>
                <Text className="text-white/50 text-xs mt-0.5">Today</Text>
              </View>
              {/* Rank */}
              <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 items-center">
                <Text className="text-3xl mb-1">🏆</Text>
                <Text className="text-hair-gold text-xl font-bold">
                  {rank?.rank ? `#${rank.rank}` : "—"}
                </Text>
                <Text className="text-white/50 text-xs mt-0.5">Rank</Text>
              </View>
              {/* Badge */}
              <View className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/10 items-center">
                <Text className="text-3xl mb-1">
                  {recentBadge ? recentBadge.iconUrl : "🎖️"}
                </Text>
                <Text className="text-white text-[10px] font-bold text-center leading-tight" numberOfLines={2}>
                  {recentBadge ? recentBadge.name : "No badge yet"}
                </Text>
                <Text className="text-white/50 text-xs mt-0.5">Badge</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Snapshot */}
        {progressComparisonData?.data && (
          <View className="px-4 mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white text-lg font-bold">Progress Snapshot</Text>
              <TouchableOpacity onPress={() => router.push("/home/progress")}>
                <Text className="text-hair-gold text-sm font-semibold">View all →</Text>
              </TouchableOpacity>
            </View>
            <View className="rounded-3xl overflow-hidden border border-white/10">
              <View className="flex-row" style={{ height: 150 }}>
                <View className="flex-1">
                  <Image
                    source={{ uri: progressComparisonData.data.before.photoUrl }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 }}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center" }}>Before</Text>
                  </LinearGradient>
                </View>
                <View className="flex-1">
                  <Image
                    source={{ uri: progressComparisonData.data.after.photoUrl }}
                    style={{ flex: 1 }}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 10 }}
                  >
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textAlign: "center" }}>After</Text>
                  </LinearGradient>
                </View>
              </View>
              {growthStatsData?.data?.totalGrowth ? (
                <View className="bg-hair-gold/10 px-4 py-3 border-t border-white/10">
                  <Text className="text-hair-gold text-center text-sm font-semibold">
                    +{growthStatsData.data.totalGrowth} cm growth in {growthStatsData.data.journeyDays} days 🌱
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Personalized Recommendations */}
        <View className="mb-6">
          <View className="px-4 flex-row items-center justify-between mb-3">
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
          ) : recsError ? (
            <TouchableOpacity
              onPress={() => queryClient.refetchQueries({ queryKey: ["recommendations", "products", "home"] })}
              className="mx-4 bg-hair-bg-dark rounded-2xl px-5 py-4 border border-white/10 flex-row items-center gap-3"
            >
              <Text style={{ fontSize: 20 }}>🔄</Text>
              <View style={{ flex: 1 }}>
                <Text className="text-white/70 text-sm font-semibold">Couldn't load recommendations</Text>
                <Text className="text-white/40 text-xs mt-0.5">Tap to retry</Text>
              </View>
            </TouchableOpacity>
          ) : recsData?.data && recsData.data.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {recsData.data.slice(0, 5).map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  onPress={() => router.push(`/explore/products/${rec.id}` as any)}
                  activeOpacity={0.88}
                >
                  <View className="w-44 rounded-3xl overflow-hidden border border-hair-gold/20">
                    {/* Product image */}
                    <Image
                      source={{
                        uri: rec.imageUrls?.[0] ??
                          "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400",
                      }}
                      style={{ width: "100%", height: 120 }}
                      resizeMode="cover"
                    />
                    {/* Info overlay */}
                    <LinearGradient
                      colors={["#2A1F1A", "#1A1310"]}
                      style={{ padding: 12 }}
                    >
                      <Text className="text-white font-bold text-sm" numberOfLines={2}>
                        {rec.name}
                      </Text>
                      <Text className="text-hair-gold text-xs font-semibold mt-1">
                        KES {rec.price?.toLocaleString()}
                      </Text>
                    </LinearGradient>
                  </View>
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
          <View className="px-4 flex-row items-center justify-between mb-3">
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
          ) : communityError ? (
            <TouchableOpacity
              onPress={() => queryClient.refetchQueries({ queryKey: ["community", "groups", "home"] })}
              className="mx-4 bg-hair-bg-dark rounded-2xl px-5 py-4 border border-white/10 flex-row items-center gap-3"
            >
              <Text style={{ fontSize: 20 }}>🔄</Text>
              <View style={{ flex: 1 }}>
                <Text className="text-white/70 text-sm font-semibold">Couldn't load community</Text>
                <Text className="text-white/40 text-xs mt-0.5">Tap to retry</Text>
              </View>
            </TouchableOpacity>
          ) : communityData?.data && communityData.data.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {communityData.data.slice(0, 3).map((group) => {
                const isActive = group.lastPostAt
                  ? (Date.now() - new Date(group.lastPostAt).getTime()) < 24 * 60 * 60 * 1000
                  : false;
                const lastPostLabel = (() => {
                  if (!group.lastPostAt) return "No posts yet";
                  const diff = Date.now() - new Date(group.lastPostAt).getTime();
                  const mins = Math.floor(diff / 60000);
                  const hours = Math.floor(diff / 3600000);
                  const days = Math.floor(diff / 86400000);
                  if (mins < 60) return `${mins}m ago`;
                  if (hours < 24) return `${hours}h ago`;
                  return `${days}d ago`;
                })();

                return (
                  <TouchableOpacity
                    key={group.id}
                    onPress={() => router.push(`/community/groups/${group.id}` as any)}
                    activeOpacity={0.9}
                  >
                    <View className="w-72 h-44 rounded-3xl overflow-hidden border border-hair-gold/30">
                      <Image
                        source={{ uri: group.coverUrl || "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800" }}
                        className="absolute inset-0 w-full h-full"
                        resizeMode="cover"
                      />
                      <LinearGradient
                        colors={["rgba(0,0,0,0.05)", "rgba(0,0,0,0.75)", "rgba(0,0,0,0.95)"]}
                        className="absolute inset-0"
                      />
                      <View className="p-4 flex-1 justify-between">
                        {/* Top row — category + active badge */}
                        <View className="flex-row items-center justify-between">
                          <View className="bg-black/60 px-3 py-1 rounded-full border border-white/10">
                            <Text className="text-hair-gold text-[10px] font-bold uppercase tracking-wider">
                              {group.category}
                            </Text>
                          </View>
                          {isActive && (
                            <View className="flex-row items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
                              <View className="w-1.5 h-1.5 rounded-full bg-green-400" />
                              <Text className="text-green-400 text-[10px] font-bold">Active</Text>
                            </View>
                          )}
                        </View>

                        {/* Bottom — name + stats */}
                        <View>
                          <Text className="text-white text-lg font-bold mb-2" numberOfLines={1}>
                            {group.name}
                          </Text>
                          <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center gap-1">
                              <Text className="text-white/60 text-xs">👥</Text>
                              <Text className="text-white/70 text-xs font-semibold">
                                {(group.memberCount ?? 0).toLocaleString()}
                              </Text>
                            </View>
                            <View className="w-px h-3 bg-white/20" />
                            <View className="flex-row items-center gap-1">
                              <Text className="text-white/60 text-xs">💬</Text>
                              <Text className="text-white/70 text-xs font-semibold">
                                {(group.postCount ?? 0).toLocaleString()} posts
                              </Text>
                            </View>
                            <View className="w-px h-3 bg-white/20" />
                            <Text className="text-white/50 text-xs">{lastPostLabel}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : null}
        </View>

        {/* Motivational Footer */}
        <View className="px-4 mb-8">
          <LinearGradient
            colors={["#2A1F1A", "#1A1310"]}
            className="rounded-3xl px-6 py-5 border border-hair-gold/10"
          >
            <Text className="text-hair-gold text-center text-sm font-semibold italic">
              "Your hair journey is unique. Embrace every step! 🌟"
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
