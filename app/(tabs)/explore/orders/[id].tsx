import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../../../lib/api/products';
import { Skeleton } from '../../../../components/ui/Skeleton';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  pending:    { label: 'Pending',    emoji: '🕐', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  processing: { label: 'Processing', emoji: '⚙️', color: 'text-blue-400',   bg: 'bg-blue-400/10' },
  shipped:    { label: 'Shipped',    emoji: '🚚', color: 'text-hair-gold',  bg: 'bg-hair-gold/10' },
  delivered:  { label: 'Delivered',  emoji: '✅', color: 'text-green-400',  bg: 'bg-green-400/10' },
  cancelled:  { label: 'Cancelled',  emoji: '❌', color: 'text-red-400',    bg: 'bg-red-400/10' },
};

const PAYMENT_LABELS: Record<string, string> = {
  mpesa: '📱 M-Pesa',
  card:  '💳 Card',
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => productsApi.getOrder(id),
    enabled: !!id,
  });

  const order = data?.data as any;
  const status = order ? (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending) : null;
  const currentStep = STATUS_STEPS.indexOf(order?.status);

  const date = order
    ? new Date(order.createdAt).toLocaleDateString('en-KE', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <View className="px-4 py-3 flex-row items-center border-b border-hair-gold/10 bg-hair-bg-dark">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-hair-gold text-base">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Order Details</Text>
          {order && (
            <Text className="text-white/40 text-xs">#{order.id.slice(-8).toUpperCase()}</Text>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="px-4 mt-4 gap-4">
          <Skeleton height={120} rounded="lg" />
          <Skeleton height={200} rounded="lg" />
          <Skeleton height={160} rounded="lg" />
        </View>
      ) : !order ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-white/50">Order not found</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Status banner */}
          <View className={`mx-4 mt-4 rounded-2xl p-5 border ${status!.bg} border-transparent items-center`}>
            <Text className="text-4xl mb-2">{status!.emoji}</Text>
            <Text className={`text-xl font-bold ${status!.color}`}>{status!.label}</Text>
            <Text className="text-white/50 text-xs mt-1">{date}</Text>
          </View>

          {/* Progress tracker — only for non-cancelled orders */}
          {order.status !== 'cancelled' && (
            <View className="mx-4 mt-4 bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/10">
              <Text className="text-white font-semibold mb-4">Order Progress</Text>
              <View className="flex-row items-center justify-between">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStep;
                  const cfg = STATUS_CONFIG[step];
                  return (
                    <View key={step} className="flex-1 items-center">
                      <View className={`w-8 h-8 rounded-full items-center justify-center mb-1 ${done ? 'bg-hair-gold' : 'bg-hair-bg-light'}`}>
                        <Text className="text-xs">{done ? '✓' : (idx + 1).toString()}</Text>
                      </View>
                      <Text className={`text-xs text-center ${done ? 'text-hair-gold' : 'text-white/30'}`}>
                        {cfg.label}
                      </Text>
                      {idx < STATUS_STEPS.length - 1 && (
                        <View
                          className={`absolute top-4 left-1/2 h-0.5 w-full ${done && idx < currentStep ? 'bg-hair-gold' : 'bg-hair-bg-light'}`}
                          style={{ zIndex: -1 }}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Items */}
          <View className="mx-4 mt-4 bg-hair-bg-dark rounded-2xl border border-hair-gold/10 overflow-hidden">
            <Text className="text-white font-semibold px-4 pt-4 pb-2">
              Items ({order.items.length})
            </Text>
            {order.items.map((item: any, idx: number) => (
              <View
                key={item.id}
                className={`flex-row items-center px-4 py-3 ${idx < order.items.length - 1 ? 'border-b border-hair-gold/10' : ''}`}
              >
                <View className="w-14 h-14 rounded-xl overflow-hidden mr-3 bg-hair-bg-light">
                  {item.product.imageUrls?.[0] ? (
                    <Image
                      source={{ uri: item.product.imageUrls[0] }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center">
                      <Text className="text-2xl">🧴</Text>
                    </View>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-white text-sm font-semibold" numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text className="text-white/40 text-xs mt-0.5">Qty: {item.quantity}</Text>
                </View>
                <Text className="text-hair-gold font-bold text-sm ml-2">
                  KES {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>

          {/* Delivery info */}
          {order.deliveryAddress && (
            <View className="mx-4 mt-4 bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/10">
              <Text className="text-white font-semibold mb-2">📍 Delivery Address</Text>
              <Text className="text-white/70 text-sm leading-5">{order.deliveryAddress}</Text>
              {order.deliveryNotes && (
                <Text className="text-white/40 text-xs mt-2 italic">{order.deliveryNotes}</Text>
              )}
            </View>
          )}

          {/* Payment summary */}
          <View className="mx-4 mt-4 bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/10">
            <Text className="text-white font-semibold mb-3">Payment Summary</Text>
            {order.paymentMethod && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/50 text-sm">Method</Text>
                <Text className="text-white text-sm">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</Text>
              </View>
            )}
            {order.paymentRef && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-white/50 text-sm">Ref</Text>
                <Text className="text-white text-sm font-mono">{order.paymentRef}</Text>
              </View>
            )}
            <View className="flex-row justify-between border-t border-hair-gold/20 pt-3 mt-1">
              <Text className="text-white font-bold">Total</Text>
              <Text className="text-hair-gold font-bold text-lg">
                KES {order.totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
