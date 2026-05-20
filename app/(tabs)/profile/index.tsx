import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { progressApi } from "../../../lib/api/progress";
import { useState } from "react";
import { profileApi, HairProfile } from "../../../lib/api/profile";
import { Button } from "../../../components/ui/Button";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useAuthStore } from "../../../store/authStore";
import { useOnboardingStore } from "../../../store/onboardingStore";
import {
  CURL_PATTERNS,
  HAIR_DENSITY,
  POROSITY,
  STRAND_THICKNESS,
  SCALP_TYPES,
  HAIR_GOALS,
} from "../../../constants/hairTypes";

const ProfileAttributeRow = ({
  label,
  data,
}: {
  label: string;
  data?: { emoji?: string; label: string; description?: string };
}) => (
  <View className="flex-row items-center">
    <View
      className={`w-12 h-12 rounded-full ${data ? "bg-hair-gold/20" : "bg-white/10"} items-center justify-center mr-3`}
    >
      <Text className="text-2xl">{data?.emoji || "❓"}</Text>
    </View>
    <View className="flex-1">
      <Text className="text-white/60 text-sm mb-1">{label}</Text>
      <Text className="text-white text-base font-semibold">
        {data?.label || "Not Set"}
      </Text>
      <Text className="text-white/70 text-sm">
        {data?.description || "Update profile to add this information"}
      </Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 10 * 60 * 1000, // 10 min — profile changes infrequently
    retry: (failureCount, error: any) => {
      if (
        error?.response?.status === 404 ||
        error?.message === "Hair profile not found"
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const { data: progressData } = useQuery({
    queryKey: ["progress", "photos"],
    queryFn: () => progressApi.getProgressPhotos({ limit: 1 }),
    staleTime: 10 * 60 * 1000,
  });

  const latestProgressPhoto = progressData?.data?.[0]?.photoUrl ?? null;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    const doLogout = async () => {
      // Clear all react-query cache
      queryClient.clear();
      // Reset onboarding store
      useOnboardingStore.getState().reset();
      // Perform store logout
      await logout();
      router.replace("/(auth)/welcome");
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to logout?")) {
        doLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: doLogout,
        },
      ]);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-hair-bg">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Header skeleton */}
          <View className="px-6 pt-6 pb-4 border-b border-hair-gold/20">
            <Skeleton height={32} width="50%" rounded="md" />
            <View className="mt-2">
              <Skeleton height={14} width="60%" rounded="sm" />
            </View>
          </View>
          {/* Photo skeleton */}
          <View className="px-6 pt-6">
            <Skeleton height={16} width="40%" rounded="sm" className="mb-3" />
            <Skeleton height={320} rounded="lg" />
          </View>
          {/* Hair profile skeleton */}
          <View className="px-6 pt-6">
            <Skeleton height={16} width="40%" rounded="sm" className="mb-3" />
            <View className="bg-hair-bg-dark rounded-2xl p-4 gap-4 border border-hair-gold/10">
              {[0, 1, 2, 3, 4].map(i => (
                <View key={i} className="flex-row items-center gap-3">
                  <Skeleton height={48} width={48} rounded="full" />
                  <View className="flex-1 gap-2">
                    <Skeleton height={12} width="30%" rounded="sm" />
                    <Skeleton height={14} width="60%" rounded="sm" />
                  </View>
                </View>
              ))}
            </View>
          </View>
          {/* Actions skeleton */}
          <View className="px-6 pt-8 gap-3">
            <Skeleton height={52} rounded="lg" />
            <Skeleton height={64} rounded="lg" />
            <Skeleton height={64} rounded="lg" />
            <Skeleton height={64} rounded="lg" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Check if it's a "Not Found" error
  const isProfileNotFound =
    (error as any)?.response?.status === 404 ||
    (error as any)?.response?.data?.message === "Hair profile not found" ||
    (error as any)?.message === "Hair profile not found";

  if (error && !isProfileNotFound) {
    return (
      <SafeAreaView className="flex-1 bg-hair-bg">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-white text-lg mb-4">
            Failed to load profile
          </Text>
          <Button variant="primary" onPress={() => refetch()}>
            Retry
          </Button>
          <Button variant="ghost" onPress={handleLogout} className="mt-4">
            Logout
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const profile: Partial<HairProfile> = apiResponse?.data || {};

  // Find display labels for profile data
  const curlPatternData = CURL_PATTERNS.find(
    (cp) => cp.value === profile.curlPattern,
  );
  const densityData = HAIR_DENSITY.find((d) => d.value === profile.density);
  const porosityData = POROSITY.find((p) => p.value === profile.porosity);
  const strandThicknessData = STRAND_THICKNESS.find(
    (st) => st.value === profile.strandThickness,
  );
  const scalpTypeData = SCALP_TYPES.find(
    (st) => st.value === profile.scalpType,
  );
  const goalsData = profile?.goals
    ? profile.goals
        .map((g: string) => HAIR_GOALS.find((goal) => goal.value === g))
        .filter(Boolean)
    : [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2994A" />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-hair-gold/20">
          <Text className="text-3xl font-bold text-white mb-1">My Profile</Text>
          <Text className="text-white/70 text-base">{user?.email}</Text>
        </View>

        {/* Hair Photo */}
        <View className="px-6 pt-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Your Hair Journey
          </Text>
          {(profile.hairPhotoUrl || latestProgressPhoto) ? (
            <View className="rounded-2xl overflow-hidden border-2 border-hair-gold">
              <Image
                source={{ uri: (profile.hairPhotoUrl || latestProgressPhoto)! }}
                className="w-full h-80"
                resizeMode="cover"
              />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/home/progress')}
              activeOpacity={0.8}
              className="rounded-2xl border-2 border-white/10 bg-white/5 h-40 items-center justify-center gap-2"
              style={{ borderStyle: 'dashed' }}
            >
              <Text className="text-3xl">📸</Text>
              <Text className="text-white/60 text-sm font-semibold">No hair photo yet</Text>
              <Text className="text-hair-gold text-xs">Go to Progress Tracker →</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Hair Profile */}
        <View className="px-6 pt-6">
          <Text className="text-white text-lg font-semibold mb-3">
            Hair Profile
          </Text>

          <Card variant="default" className="mb-3">
            <CardContent>
              <View className="gap-4">
                <ProfileAttributeRow
                  label="Curl Pattern"
                  data={curlPatternData}
                />
                <ProfileAttributeRow label="Hair Density" data={densityData} />
                <ProfileAttributeRow label="Porosity" data={porosityData} />
                <ProfileAttributeRow
                  label="Strand Thickness"
                  data={strandThicknessData}
                />
                <ProfileAttributeRow label="Scalp Type" data={scalpTypeData} />
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Hair Goals */}
        {goalsData?.length > 0 ? (
          <View className="px-6 pt-4">
            <Text className="text-white text-lg font-semibold mb-3">
              My Goals
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {goalsData.map((goal: any, index: number) => (
                <View
                  key={goal?.value || index}
                  className="flex-row items-center bg-hair-gold/10 px-3 py-1.5 rounded-full border border-hair-gold/30"
                >
                  <Text className="text-lg mr-2">{goal?.emoji}</Text>
                  <Text className="text-white text-sm font-medium">
                    {goal?.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="px-6 pt-4">
            <Text className="text-white text-lg font-semibold mb-3">
              My Goals
            </Text>
            <Text className="text-white/40 italic">No goals selected</Text>
          </View>
        )}

        {/* Growth Stats */}
        {(profile.currentLength || profile.targetLength) && (
          <View className="px-6 pt-6">
            <Text className="text-white text-lg font-semibold mb-3">
              Growth Journey
            </Text>
            <Card variant="default">
              <CardContent>
                <View className="gap-3">
                  {profile.currentLength && (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white/70 text-base">
                        Current Length
                      </Text>
                      <Text className="text-white text-lg font-bold">
                        {profile.currentLength} cm
                      </Text>
                    </View>
                  )}
                  {profile.targetLength && (
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white/70 text-base">
                        Target Length
                      </Text>
                      <Text className="text-hair-gold text-lg font-bold">
                        {profile.targetLength} cm
                      </Text>
                    </View>
                  )}
                  {profile.currentLength && profile.targetLength && (
                    <View className="pt-2 border-t border-hair-gold/20">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-white/70 text-sm">Progress</Text>
                        <Text className="text-white text-sm font-semibold">
                          {Math.round(
                            (profile.currentLength / profile.targetLength) *
                              100,
                          )}
                          %
                        </Text>
                      </View>
                      <View className="h-2 bg-hair-bg-light rounded-full overflow-hidden">
                        <View
                          className="h-full bg-hair-gold"
                          style={{
                            width: `${Math.min((profile.currentLength / profile.targetLength) * 100, 100)}%`,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Account Actions */}
        <View className="px-6 pt-8 gap-3">
          <Button
            variant="secondary"
            size="lg"
            onPress={() => {
              useOnboardingStore.getState().setEditMode(true);
              router.push("/(onboarding)/age-group");
            }}
          >
            {isProfileNotFound || !apiResponse?.data
              ? "Complete Profile"
              : "Update Profile"}
          </Button>
          <TouchableOpacity
            onPress={() => router.push('/profile/my-routines')}
            className="flex-row items-center bg-hair-bg-dark rounded-2xl px-5 py-4 border border-hair-gold/20"
          >
            <Text className="text-2xl mr-3">✅</Text>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">
                Customize Routines
              </Text>
              <Text className="text-white/50 text-xs">
                Choose your daily checklist routines
              </Text>
            </View>
            <Text className="text-hair-gold text-base">→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/profile/reminders')}
            className="flex-row items-center bg-hair-bg-dark rounded-2xl px-5 py-4 border border-hair-gold/20"
          >
            <Text className="text-2xl mr-3">🔔</Text>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">
                Smart Reminders
              </Text>
              <Text className="text-white/50 text-xs">
                Manage your routine alerts
              </Text>
            </View>
            <Text className="text-hair-gold text-base">→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/explore/orders')}
            className="flex-row items-center bg-hair-bg-dark rounded-2xl px-5 py-4 border border-hair-gold/20"
          >
            <Text className="text-2xl mr-3">📦</Text>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">My Orders</Text>
              <Text className="text-white/50 text-xs">Track your purchases</Text>
            </View>
            <Text className="text-hair-gold text-base">→</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/profile/referrals')}
            className="flex-row items-center bg-hair-bg-dark rounded-2xl px-5 py-4 border border-hair-gold/20"
          >
            <Text className="text-2xl mr-3">🎁</Text>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">
                Refer & Earn
              </Text>
              <Text className="text-white/50 text-xs">
                Invite friends, get discounts
              </Text>
            </View>
            <Text className="text-hair-gold text-base">→</Text>
          </TouchableOpacity>
          <Button variant="ghost" size="md" onPress={handleLogout}>
            Logout
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
