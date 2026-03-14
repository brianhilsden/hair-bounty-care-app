import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { CreateReviewData } from "../../lib/api/reviews";

export const TARGET_TYPE_CONFIG: Record<
  string,
  { emoji: string; label: string; color: string }
> = {
  product: { emoji: "🧴", label: "Product", color: "text-blue-400" },
  salon: { emoji: "💈", label: "Salon", color: "text-pink-400" },
  general: { emoji: "💬", label: "Hair Tip", color: "text-purple-400" },
};

export function StarRow({
  rating,
  size = "md",
  onSelect,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  onSelect?: (r: number) => void;
}) {
  const sizes = { sm: 14, md: 20, lg: 28 };
  const px = sizes[size];
  return (
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <TouchableOpacity
          key={s}
          onPress={() => onSelect?.(s)}
          disabled={!onSelect}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={{ fontSize: px }}>{s <= rating ? "⭐" : "☆"}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function WriteReviewModal({
  visible,
  onClose,
  onSubmit,
  isLoading,
  initialTargetType = "general",
  fixedTargetType = false,
  targetId,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateReviewData) => void;
  isLoading: boolean;
  initialTargetType?: "product" | "salon" | "general";
  fixedTargetType?: boolean;
  targetId?: string;
}) {
  const [targetType, setTargetType] = useState<"product" | "salon" | "general">(
    initialTargetType,
  );
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert("Required", "Please write your review content.");
      return;
    }
    if (rating === 0) {
      Alert.alert("Required", "Please select a rating.");
      return;
    }
    onSubmit({ targetType, targetId, rating, content: content.trim() });
  };

  const handleClose = () => {
    setTargetType(initialTargetType);
    setRating(5);
    setContent("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-hair-bg">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center border-b border-hair-gold/10 bg-hair-bg-dark">
          <TouchableOpacity onPress={handleClose} className="mr-4">
            <Text className="text-white/60 text-base">Cancel</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-white text-lg font-bold text-center">
            Write a Review
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color="#D2994A" size="small" />
            ) : (
              <Text
                className={`text-base font-bold ${content.trim() ? "text-hair-gold" : "text-hair-gold/30"}`}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pt-6">
          {/* Category */}
          {!fixedTargetType && (
            <>
              <Text className="text-white font-semibold mb-3">
                What are you reviewing?
              </Text>
              <View className="flex-row gap-3 mb-6">
                {(["product", "salon", "general"] as const).map((t) => {
                  const cfg = TARGET_TYPE_CONFIG[t];
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTargetType(t)}
                      className={`flex-1 py-3 rounded-2xl items-center border ${
                        targetType === t
                          ? "bg-hair-gold border-hair-gold"
                          : "bg-hair-bg-dark border-hair-gold/20"
                      }`}
                    >
                      <Text className="text-2xl mb-1">{cfg.emoji}</Text>
                      <Text
                        className={`text-xs font-semibold ${targetType === t ? "text-white" : "text-white/60"}`}
                      >
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Rating */}
          <Text className="text-white font-semibold mb-3">Rating</Text>
          <View className="items-center mb-6">
            <StarRow rating={rating} size="lg" onSelect={setRating} />
            <Text className="text-white/40 text-sm mt-2">
              {rating === 1
                ? "Poor"
                : rating === 2
                  ? "Fair"
                  : rating === 3
                    ? "Good"
                    : rating === 4
                      ? "Very Good"
                      : "Excellent"}
            </Text>
          </View>

          {/* Content */}
          <Text className="text-white font-semibold mb-3">Your Review</Text>
          <View className="bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20 mb-8">
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share your honest experience..."
              placeholderTextColor="#7a6a5a"
              multiline
              numberOfLines={6}
              className="text-white text-sm leading-5"
              style={{ minHeight: 120, textAlignVertical: "top" }}
              autoFocus={fixedTargetType}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
