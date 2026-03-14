import { View, Text, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { productsApi } from '../../../../lib/api/products';
import { reviewsApi } from '../../../../lib/api/reviews';
import { useCartStore } from '../../../../store/cartStore';
import { useToast } from '../../../../components/ui/Toast';
import { Skeleton } from '../../../../components/ui/Skeleton';

const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  DIY_INGREDIENT:  { label: 'DIY Ingredient', emoji: '🌿', color: 'text-emerald-400' },
  READY_MADE:      { label: 'Ready-Made',      emoji: '🧴', color: 'text-blue-400'    },
  HAIR_BOUNTY_OWN: { label: 'Our Brand',       emoji: '⭐', color: 'text-hair-gold'   },
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem, totalItems } = useCartStore();
  const { show: showToast } = useToast();
  const [qty, setQty] = useState(1);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'product', id],
    queryFn: () => reviewsApi.getReviewsForTarget('product', id),
    enabled: !!id,
  });

  const product = productData?.data;
  const reviews = reviewsData?.data ?? [];
  const typeConfig = product ? TYPE_LABELS[product.productType] : null;

  const handleAddToCart = () => {
    if (!product) return;
    // Add item qty times (store increments by 1 each call)
    for (let i = 0; i < qty; i++) {
      addItem({ productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrls[0] });
    }
    showToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View className="h-56">
          {product ? (
            <Image
              source={{ uri: product.imageUrls?.[0] ?? "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400" }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 bg-hair-gold/10" />
          )}
          <TouchableOpacity onPress={() => router.back()} className="absolute top-4 left-4 bg-black/50 rounded-full px-3 py-1.5">
            <Text className="text-white text-sm font-semibold">← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/explore/products/cart')} className="absolute top-4 right-4 bg-black/50 rounded-full px-3 py-1.5 flex-row items-center gap-1">
            <Text className="text-white text-sm">🛒</Text>
            {totalItems() > 0 && <Text className="text-white text-xs font-bold">{totalItems()}</Text>}
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View className="px-6 pt-5 gap-4">
            <Skeleton height={28} width="70%" rounded="md" />
            <Skeleton height={16} width="40%" rounded="sm" />
            <Skeleton height={100} rounded="lg" />
          </View>
        ) : product ? (
          <>
            <View className="px-6 pt-5">
              {typeConfig && (
                <View className="flex-row items-center mb-2">
                  <Text className={`text-sm font-semibold ${typeConfig.color}`}>{typeConfig.emoji} {typeConfig.label}</Text>
                  <Text className="text-white/30 mx-2">·</Text>
                  <Text className="text-white/50 text-sm">{product.category.name}</Text>
                </View>
              )}
              <Text className="text-white text-2xl font-bold mb-2">{product.name}</Text>

              <View className="flex-row items-center gap-3 mb-4">
                <View className="flex-row items-center">
                  <Text className="text-amber-400">⭐</Text>
                  <Text className="text-white font-semibold ml-1">{product.rating.toFixed(1)}</Text>
                  <Text className="text-white/40 text-sm ml-1">({product.reviewCount})</Text>
                </View>
                {product.isEcoCertified && <View className="bg-emerald-500/20 rounded-full px-2 py-0.5"><Text className="text-emerald-400 text-xs">♻️ Eco</Text></View>}
                {product.isZeroWaste    && <View className="bg-green-500/20 rounded-full px-2 py-0.5"><Text className="text-green-400 text-xs">🌿 Zero Waste</Text></View>}
              </View>

              <Text className="text-white/70 text-sm leading-5 mb-5">{product.description}</Text>

              {/* Price + Qty */}
              <View className="bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20 mb-5">
                <View className="flex-row items-center justify-between">
                  <Text className="text-hair-gold text-3xl font-bold">KES {product.price.toLocaleString()}</Text>
                  <View className="flex-row items-center gap-3">
                    <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 bg-hair-bg-light rounded-full items-center justify-center">
                      <Text className="text-white font-bold">−</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg w-6 text-center">{qty}</Text>
                    <TouchableOpacity onPress={() => setQty(qty + 1)} className="w-8 h-8 bg-hair-gold rounded-full items-center justify-center">
                      <Text className="text-white font-bold">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Reviews */}
              <Text className="text-white text-lg font-bold mb-3">Reviews ({reviews.length})</Text>
              {reviews.length === 0 ? (
                <Text className="text-white/40 text-sm mb-5">No reviews yet for this product.</Text>
              ) : (
                reviews.slice(0, 4).map(r => (
                  <View key={r.id} className="bg-hair-bg-dark rounded-2xl p-4 mb-3 border border-hair-gold/10">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-white font-semibold text-sm">{r.user.firstName} {r.user.lastName[0]}.</Text>
                      <View className="flex-row">{[1,2,3,4,5].map(s => <Text key={s} style={{ fontSize: 12 }}>{s <= r.rating ? '⭐' : '☆'}</Text>)}</View>
                    </View>
                    <Text className="text-white/70 text-sm">{r.content}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Bottom action bar */}
      {product && (
        <View className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-hair-bg-dark border-t border-hair-gold/10">
          {product.affiliateUrl ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(product.affiliateUrl!)}
              className="bg-hair-gold rounded-2xl py-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">🔗</Text>
              <Text className="text-white font-bold text-base">Buy from Partner</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleAddToCart}
              className="bg-hair-gold rounded-2xl py-4 items-center flex-row justify-center gap-2"
            >
              <Text className="text-2xl">🛒</Text>
              <Text className="text-white font-bold text-base">Add to Cart · KES {(product.price * qty).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
