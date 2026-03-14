import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { salonsApi } from "../../../../lib/api/salons";
import { reviewsApi } from "../../../../lib/api/reviews";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { EmptyState } from "../../../../components/shared/EmptyState";
import { WriteReviewModal } from "../../../../components/shared/WriteReviewModal";

function InfoRow({
  emoji,
  label,
  value,
}: {
  emoji: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center py-3 border-b border-hair-gold/10">
      <Text className="text-xl mr-3">{emoji}</Text>
      <View className="flex-1">
        <Text className="text-white/50 text-xs mb-0.5">{label}</Text>
        <Text className="text-white text-sm font-medium">{value}</Text>
      </View>
    </View>
  );
}

export default function SalonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showReviewModal, setShowReviewModal] = useState(false);

  const createMutation = useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: () => {
      setShowReviewModal(false);
      queryClient.invalidateQueries({ queryKey: ["reviews", "salon", id] });
      queryClient.invalidateQueries({ queryKey: ["salon", id] });
      Alert.alert("Success", "Your review has been posted!");
    },
    onError: () =>
      Alert.alert("Error", "Failed to post review. Please try again."),
  });

  const { data: salonData, isLoading } = useQuery({
    queryKey: ["salon", id],
    queryFn: () => salonsApi.getSalon(id),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", "salon", id],
    queryFn: () => reviewsApi.getReviewsForTarget("salon", id),
    enabled: !!id,
  });

  const salon = salonData?.data;
  const reviews = reviewsData?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <View className="h-48 bg-hair-gold/10 items-center justify-center">
          <Text style={{ fontSize: 72 }}>💈</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 bg-black/40 rounded-full px-3 py-1.5"
          >
            <Text className="text-white text-sm font-semibold">← Back</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="px-6 pt-5 gap-4">
            <Skeleton height={28} width="70%" rounded="md" />
            <Skeleton height={16} width="40%" rounded="sm" />
            <Skeleton height={80} rounded="lg" />
          </View>
        ) : salon ? (
          <>
            {/* Name + rating */}
            <View className="px-6 pt-5 pb-4">
              <Text className="text-white text-2xl font-bold mb-1">
                {salon.name}
              </Text>
              <View className="flex-row items-center gap-3 mb-3">
                <View className="flex-row items-center">
                  <Text className="text-amber-400">⭐</Text>
                  <Text className="text-white font-semibold ml-1">
                    {salon.rating.toFixed(1)}
                  </Text>
                  <Text className="text-white/40 text-sm ml-1">
                    ({salon.reviewCount} reviews)
                  </Text>
                </View>
                {salon.distance != null && (
                  <Text className="text-hair-gold text-sm font-semibold">
                    📍 {salon.distance} km
                  </Text>
                )}
              </View>
              <Text className="text-white/70 text-sm leading-5">
                {salon.description}
              </Text>
            </View>

            {/* Tags */}
            <View className="px-6 mb-4">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {salon.isHighEnd && (
                  <View className="bg-amber-500/20 rounded-full px-3 py-1">
                    <Text className="text-amber-400 text-sm">⭐ High-End</Text>
                  </View>
                )}
                {salon.isBudget && (
                  <View className="bg-green-500/20 rounded-full px-3 py-1">
                    <Text className="text-green-400 text-sm">💰 Budget</Text>
                  </View>
                )}
                {salon.isKidsFriendly && (
                  <View className="bg-blue-500/20 rounded-full px-3 py-1">
                    <Text className="text-blue-400 text-sm">
                      👶 Kids-Friendly
                    </Text>
                  </View>
                )}
                {salon.isOrganic && (
                  <View className="bg-emerald-500/20 rounded-full px-3 py-1">
                    <Text className="text-emerald-400 text-sm">🌿 Organic</Text>
                  </View>
                )}
                {salon.isGreenCertified && (
                  <View className="bg-emerald-600/20 rounded-full px-3 py-1">
                    <Text className="text-emerald-300 text-sm">
                      ♻️ Eco Certified
                    </Text>
                  </View>
                )}
                {salon.specialties.map((s) => (
                  <View
                    key={s}
                    className="bg-hair-gold/20 rounded-full px-3 py-1"
                  >
                    <Text className="text-hair-gold text-sm capitalize">
                      {s}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Contact info */}
            <View className="mx-6 bg-hair-bg-dark rounded-2xl border border-hair-gold/10 px-4 mb-6">
              {salon.address && (
                <InfoRow
                  emoji="📍"
                  label="Address"
                  value={`${salon.address}, ${salon.city}`}
                />
              )}
              {salon.phone && (
                <InfoRow emoji="📞" label="Phone" value={salon.phone} />
              )}
              {salon.email && (
                <InfoRow emoji="✉️" label="Email" value={salon.email} />
              )}
            </View>

            {/* Action buttons */}
            <View className="px-6 flex-row gap-3 mb-6">
              {salon.phone && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${salon.phone}`)}
                  className="flex-1 bg-hair-gold rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                >
                  <Text className="text-xl">📞</Text>
                  <Text className="text-white font-bold">Call</Text>
                </TouchableOpacity>
              )}
              {salon.latitude && salon.longitude && (
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `https://maps.google.com/?q=${salon.latitude},${salon.longitude}`,
                    )
                  }
                  className="flex-1 bg-hair-bg-dark border border-hair-gold/30 rounded-2xl py-3.5 items-center flex-row justify-center gap-2"
                >
                  <Text className="text-xl">🗺️</Text>
                  <Text className="text-hair-gold font-bold">Directions</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Reviews */}
            <View className="px-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-bold">
                  Reviews ({reviews.length})
                </Text>
                <TouchableOpacity onPress={() => setShowReviewModal(true)}>
                  <Text className="text-hair-gold text-sm">Write Review →</Text>
                </TouchableOpacity>
              </View>
              {reviews.length === 0 ? (
                <EmptyState
                  emoji="⭐"
                  title="No reviews yet"
                  description="Be the first to review this salon!"
                />
              ) : (
                reviews.slice(0, 5).map((review) => (
                  <View
                    key={review.id}
                    className="bg-hair-bg-dark rounded-2xl p-4 mb-3 border border-hair-gold/10"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white font-semibold text-sm">
                        {review.user.firstName} {review.user.lastName[0]}.
                      </Text>
                      <View className="flex-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Text key={s} style={{ fontSize: 12 }}>
                            {s <= review.rating ? "⭐" : "☆"}
                          </Text>
                        ))}
                      </View>
                    </View>
                    <Text className="text-white/70 text-sm leading-5">
                      {review.content}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      <WriteReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={(data) =>
          createMutation.mutate({ ...data, targetType: "salon", targetId: id })
        }
        isLoading={createMutation.isPending}
        initialTargetType="salon"
        fixedTargetType={true}
        targetId={id}
      />
    </SafeAreaView>
  );
}
