import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useToast } from "../../../components/ui/Toast";
import { reviewsApi, Review } from "../../../lib/api/reviews";
import { Avatar } from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/shared/EmptyState";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  TARGET_TYPE_CONFIG,
  StarRow,
  WriteReviewModal,
} from "../../../components/shared/WriteReviewModal";

type FilterType = "all" | "product" | "salon" | "general";

const FILTER_OPTIONS: { key: FilterType; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "product", label: "Products", emoji: "🧴" },
  { key: "salon", label: "Salons", emoji: "💈" },
  { key: "general", label: "Tips", emoji: "💬" },
];

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function ReviewCard({
  review,
  currentUserId,
}: {
  review: Review;
  currentUserId?: string;
}) {
  const config = TARGET_TYPE_CONFIG[review.targetType];
  const isOwn = review.user.id === currentUserId;

  return (
    <View className="bg-hair-bg-dark rounded-2xl p-4 mb-4 border border-hair-gold/10">
      {/* Type badge */}
      <View className="flex-row items-center mb-3">
        <View className="flex-row items-center bg-hair-bg-light rounded-full px-3 py-1 mr-auto">
          <Text className="text-base mr-1">{config.emoji}</Text>
          <Text className={`text-xs font-semibold ${config.color}`}>
            {config.label}
          </Text>
        </View>
        <StarRow rating={review.rating} size="sm" />
      </View>

      {/* Author */}
      <View className="flex-row items-center mb-3">
        <Avatar
          uri={review.user.avatarUrl}
          name={`${review.user.firstName} ${review.user.lastName}`}
          size="sm"
        />
        <View className="ml-3 flex-1">
          <Text className="text-white font-semibold text-sm">
            {review.user.firstName} {review.user.lastName}
            {isOwn && <Text className="text-hair-gold"> (You)</Text>}
          </Text>
          <Text className="text-white/40 text-xs">
            {timeAgo(review.createdAt)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-white/90 text-sm leading-5">{review.content}</Text>
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", filter],
    queryFn: () =>
      reviewsApi.getReviews({
        targetType: filter === "all" ? undefined : filter,
        limit: 50,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: reviewsApi.createReview,
    onSuccess: () => {
      setShowModal(false);
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      showToast("Review posted! ⭐", "success");
    },
    onError: () => showToast("Failed to post review. Please try again.", "error"),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["reviews"] });
    } finally {
      setRefreshing(false);
    }
  };

  const reviews = data?.data ?? [];

  // Average rating across visible reviews
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
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
        {/* Header */}
        <View className="px-4 py-3 flex-row items-center border-b border-hair-gold/10 bg-hair-bg-dark">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-hair-gold text-base">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white font-bold text-lg">
              Community Reviews
            </Text>
            <Text className="text-white/40 text-xs">
              Honest feedback from the community
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-hair-gold rounded-full px-4 py-2"
          >
            <Text className="text-white text-sm font-bold">+ Review</Text>
          </TouchableOpacity>
        </View>

        {/* Stats banner */}
        {reviews.length > 0 && (
          <View className="mx-6 mt-5 mb-2 bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20 flex-row items-center gap-4">
            <View className="items-center flex-1">
              <Text className="text-hair-gold text-3xl font-bold">
                {avgRating.toFixed(1)}
              </Text>
              <StarRow rating={Math.round(avgRating)} size="sm" />
              <Text className="text-white/40 text-xs mt-1">Avg Rating</Text>
            </View>
            <View className="w-px h-12 bg-hair-gold/20" />
            <View className="items-center flex-1">
              <Text className="text-white text-3xl font-bold">
                {reviews.length}
              </Text>
              <Text className="text-white/40 text-xs mt-1">Reviews</Text>
            </View>
            <View className="w-px h-12 bg-hair-gold/20" />
            <View className="items-center flex-1">
              <Text className="text-white text-3xl font-bold">
                {reviews.filter((r) => r.rating >= 4).length}
              </Text>
              <Text className="text-white/40 text-xs mt-1">Positive</Text>
            </View>
          </View>
        )}

        {/* Filters */}
        <View className="mt-4 mb-2 h-10 flex-none">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setFilter(opt.key)}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  filter === opt.key
                    ? "bg-hair-gold border-hair-gold"
                    : "bg-hair-bg-dark border-hair-gold/20"
                }`}
              >
                <Text className="mr-1.5">{opt.emoji}</Text>
                <Text
                  className={`text-sm font-semibold ${filter === opt.key ? "text-white" : "text-white/60"}`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Review list */}
        <View className="px-6 mt-4">
          {isLoading ? (
            <View className="gap-4">
              {[...Array(3)].map((_, i) => (
                <View key={i} className="bg-hair-bg-dark rounded-2xl p-4 gap-3">
                  <Skeleton height={14} width="40%" rounded="md" />
                  <View className="flex-row items-center gap-3">
                    <Skeleton height={32} width={32} rounded="full" />
                    <Skeleton height={12} width="50%" rounded="sm" />
                  </View>
                  <Skeleton height={12} rounded="sm" />
                  <Skeleton height={12} width="80%" rounded="sm" />
                </View>
              ))}
            </View>
          ) : reviews.length === 0 ? (
            <EmptyState
              emoji="⭐"
              title="No reviews yet"
              description={
                filter === "all"
                  ? "Be the first to share your honest experience!"
                  : `No ${filter} reviews yet. Add the first one!`
              }
              actionLabel="Write a Review"
              onAction={() => setShowModal(true)}
            />
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                currentUserId={user?.id}
              />
            ))
          )}
        </View>
      </ScrollView>

      <WriteReviewModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />
    </SafeAreaView>
  );
}
