import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { salonsApi, Salon } from "../../../../lib/api/salons";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { EmptyState } from "../../../../components/shared/EmptyState";

const FILTER_CHIPS = [
  { key: "isHighEnd", label: "⭐ High-End" },
  { key: "isBudget", label: "💰 Budget" },
  { key: "isKidsFriendly", label: "👶 Kids" },
  { key: "isOrganic", label: "🌿 Organic" },
  { key: "isGreenCertified", label: "♻️ Eco" },
];

function SalonCard({ salon, onPress }: { salon: Salon; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/10 overflow-hidden mb-4">
        <View className="h-32 bg-hair-gold/10 items-center justify-center">
          <Text style={{ fontSize: 56 }}>💈</Text>
        </View>
        <View className="p-4">
          <View className="flex-row items-start justify-between mb-1">
            <Text
              className="text-white font-bold text-base flex-1 mr-2"
              numberOfLines={1}
            >
              {salon.name}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-amber-400 text-sm">⭐</Text>
              <Text className="text-white/70 text-sm ml-1">
                {salon.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text className="text-white/50 text-xs mb-2">
            {salon.city} · {salon.reviewCount} reviews
          </Text>
          <Text className="text-white/70 text-sm" numberOfLines={2}>
            {salon.description}
          </Text>

          {salon.distance != null && (
            <Text className="text-hair-gold text-xs mt-2 font-semibold">
              📍 {salon.distance} km away
            </Text>
          )}

          {/* Tags */}
          <View className="flex-row flex-wrap gap-1.5 mt-3">
            {salon.isHighEnd && (
              <View className="bg-amber-500/20 rounded-full px-2 py-0.5">
                <Text className="text-amber-400 text-xs">High-End</Text>
              </View>
            )}
            {salon.isBudget && (
              <View className="bg-green-500/20 rounded-full px-2 py-0.5">
                <Text className="text-green-400 text-xs">Budget</Text>
              </View>
            )}
            {salon.isKidsFriendly && (
              <View className="bg-blue-500/20 rounded-full px-2 py-0.5">
                <Text className="text-blue-400 text-xs">Kids-Friendly</Text>
              </View>
            )}
            {salon.isOrganic && (
              <View className="bg-emerald-500/20 rounded-full px-2 py-0.5">
                <Text className="text-emerald-400 text-xs">Organic</Text>
              </View>
            )}
            {salon.specialties.slice(0, 2).map((s) => (
              <View
                key={s}
                className="bg-hair-gold/20 rounded-full px-2 py-0.5"
              >
                <Text className="text-hair-gold text-xs capitalize">{s}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SalonsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  const queryParams = { search: search || undefined, ...filters };

  const { data, isLoading } = useQuery({
    queryKey: ["salons", queryParams],
    queryFn: () => salonsApi.getSalons(queryParams),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["salons"] });
    setRefreshing(false);
  };

  const toggleFilter = (key: string) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const salons = data?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-hair-bg-dark border-b border-hair-gold/10">
        <TouchableOpacity
          onPress={() => router.push("/explore")}
          className="mr-3 p-1"
        >
          <Text className="text-hair-gold text-base">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Hair Salons</Text>
          <Text className="text-white/40 text-xs">
            Find your perfect stylist
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="mx-4 mt-4 mb-3 flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/20">
        <Text className="text-white/40 mr-2">🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or city..."
          placeholderTextColor="#7a6a5a"
          className="flex-1 text-white text-sm"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text className="text-white/40 text-base">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View className="mb-3 h-10 flex-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = !!filters[chip.key];
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => toggleFilter(chip.key)}
                className={`px-4 py-2 rounded-full border ${active ? "bg-hair-gold border-hair-gold" : "bg-hair-bg-dark border-hair-gold/20"}`}
              >
                <Text
                  className={`text-sm font-semibold ${active ? "text-white" : "text-white/60"}`}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D2994A"
          />
        }
      >
        {isLoading ? (
          <View className="gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={220} rounded="lg" />
            ))}
          </View>
        ) : salons.length === 0 ? (
          <EmptyState
            emoji="💈"
            title="No salons found"
            description="Try adjusting your search or filters"
          />
        ) : (
          salons.map((salon) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              onPress={() => router.push(`/explore/salons/${salon.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
