import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  notificationsApi,
  AppNotification,
} from "../../../lib/api/notifications";
import { useToast } from "../../../components/ui/Toast";

const TYPE_ICONS: Record<string, string> = {
  ROUTINE_REMINDER: "⏰",
  BADGE_EARNED: "🏆",
  STREAK_MILESTONE: "🔥",
  COMMUNITY_POST: "👥",
  PRODUCT_RESTOCK: "📦",
  OFFER: "🎁",
  SYSTEM: "📢",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  const icon = TYPE_ICONS[item.type] ?? "🔔";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-start px-6 py-4 border-b border-white/5 ${
        item.isRead ? "" : "bg-hair-gold/5"
      }`}
    >
      {/* Unread dot */}
      {!item.isRead && (
        <View className="w-2 h-2 rounded-full bg-hair-gold mt-2 mr-3 shrink-0" />
      )}
      {item.isRead && <View className="w-2 h-2 mr-3 shrink-0" />}

      {/* Icon bubble */}
      <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3 shrink-0">
        <Text className="text-xl">{icon}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text
          className={`text-sm font-semibold mb-0.5 ${
            item.isRead ? "text-white/70" : "text-white"
          }`}
        >
          {item.title}
        </Text>
        <Text className="text-white/50 text-sm leading-5">{item.body}</Text>
        <Text className="text-white/30 text-xs mt-1">
          {timeAgo(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { show } = useToast();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getNotifications,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      show("All notifications marked as read", "success");
    },
  });

  const notifications = data?.data?.notifications ?? [];
  const unreadCount = data?.data?.unreadCount ?? 0;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-3 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
          >
            <Text className="text-white text-lg">←</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Notifications</Text>
            {unreadCount > 0 && (
              <Text className="text-white/50 text-xs">
                {unreadCount} unread
              </Text>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Text className="text-hair-gold text-sm font-semibold">
              {markAllReadMutation.isPending ? "Marking..." : "Mark all read"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#D2994A" size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">🔔</Text>
          <Text className="text-white text-xl font-bold mb-2">
            All caught up!
          </Text>
          <Text className="text-white/50 text-sm text-center">
            No notifications yet. Keep up your hair routine to earn badges and
            streaks!
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#D2994A"
            />
          }
        >
          {notifications.map((item) => (
            <NotificationRow
              key={item.id}
              item={item}
              onPress={() => {
                if (!item.isRead) {
                  markReadMutation.mutate(item.id);
                }
              }}
            />
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
