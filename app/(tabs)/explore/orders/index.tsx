import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { productsApi, Order } from '../../../../lib/api/products';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/shared/EmptyState';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  processing: { label: 'Processing', color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  shipped:    { label: 'Shipped',    color: 'text-hair-gold',  bg: 'bg-hair-gold/10' },
  delivered:  { label: 'Delivered',  color: 'text-green-400',  bg: 'bg-green-400/10' },
  cancelled:  { label: 'Cancelled',  color: 'text-red-400',    bg: 'bg-red-400/10' },
};

function OrderCard({ order, onPress }: { order: Order; onPress: () => void }) {
  const status = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const date = new Date(order.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-hair-bg-dark rounded-2xl border border-hair-gold/10 p-4 mb-3"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white font-bold text-sm">
          #{order.id.slice(-8).toUpperCase()}
        </Text>
        <View className={`px-3 py-1 rounded-full ${status.bg}`}>
          <Text className={`text-xs font-semibold ${status.color}`}>{status.label}</Text>
        </View>
      </View>

      <Text className="text-white/50 text-xs mb-3">{date}</Text>

      <View className="flex-row flex-wrap gap-1 mb-3">
        {order.items.slice(0, 2).map((item) => (
          <Text key={item.id} className="text-white/70 text-xs" numberOfLines={1}>
            {item.product.name} ×{item.quantity}
            {order.items.indexOf(item) < order.items.slice(0, 2).length - 1 ? ',' : ''}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text className="text-white/40 text-xs">+{order.items.length - 2} more</Text>
        )}
      </View>

      <View className="flex-row items-center justify-between border-t border-hair-gold/10 pt-3">
        <Text className="text-white/50 text-xs">{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
        <Text className="text-hair-gold font-bold text-sm">
          KES {order.totalAmount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: productsApi.getOrders,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['orders'] });
    setRefreshing(false);
  };

  const orders: Order[] = (data?.data as any) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <View className="px-4 py-3 flex-row items-center border-b border-hair-gold/10 bg-hair-bg-dark">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-hair-gold text-base">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">My Orders</Text>
          <Text className="text-white/40 text-xs">Track your purchases</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2994A" />
        }
      >
        {isLoading ? (
          <View className="gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} height={130} rounded="lg" />)}
          </View>
        ) : orders.length === 0 ? (
          <EmptyState
            emoji="📦"
            title="No orders yet"
            description="Your orders will appear here after checkout."
            actionLabel="Shop Now"
            onAction={() => router.push('/explore/products')}
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => router.push(`/explore/orders/${order.id}`)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
