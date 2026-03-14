import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  productsApi,
  Product,
  ProductCategory,
} from "../../../../lib/api/products";
import { useCartStore } from "../../../../store/cartStore";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { EmptyState } from "../../../../components/shared/EmptyState";

const TYPE_FILTERS = [
  { key: "", label: "All", emoji: "✨" },
  { key: "READY_MADE", label: "Ready-Made", emoji: "🧴" },
  { key: "DIY_INGREDIENT", label: "DIY", emoji: "🌿" },
  { key: "HAIR_BOUNTY_OWN", label: "Our Brand", emoji: "⭐" },
];

function ProductCard({
  product,
  onPress,
  onAddToCart,
}: {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className="w-[47%]"
    >
      <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/10 overflow-hidden mb-4">
        <View className="h-28">
          <Image
            source={{ uri: product.imageUrls?.[0] ?? "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400" }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
          {product.isEcoCertified && (
            <View className="absolute top-2 right-2 bg-emerald-500/80 rounded-full px-1.5 py-0.5">
              <Text className="text-white text-xs">♻️</Text>
            </View>
          )}
        </View>
        <View className="p-3">
          <Text
            className="text-white text-sm font-semibold mb-0.5"
            numberOfLines={2}
          >
            {product.name}
          </Text>
          <Text className="text-white/40 text-xs mb-2">
            {product.category.name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-hair-gold font-bold text-sm">
              KES {product.price.toLocaleString()}
            </Text>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="bg-hair-gold rounded-full w-7 h-7 items-center justify-center"
            >
              <Text className="text-white font-bold text-base">+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ProductsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { addItem, totalItems } = useCartStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories"],
    queryFn: productsApi.getCategories,
  });

  const queryParams = {
    search: search || undefined,
    productType: typeFilter || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productsApi.getProducts(queryParams),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["products"] });
    setRefreshing(false);
  };

  const products = data?.data ?? [];

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrls[0],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Header */}
      <View className="px-4 py-3 flex-row items-center bg-hair-bg-dark border-b border-hair-gold/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Text className="text-hair-gold text-base">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white font-bold text-lg">Shop Products</Text>
          <Text className="text-white/40 text-xs">Hair care essentials</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/explore/products/cart")}
          className="relative"
        >
          <Text className="text-2xl">🛒</Text>
          {totalItems() > 0 && (
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-hair-gold rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {totalItems()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="mx-4 mt-4 mb-3 flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/20">
        <Text className="text-white/40 mr-2">🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor="#7a6a5a"
          className="flex-1 text-white text-sm"
        />
      </View>

      {/* Type filters */}
      <View className="mb-3 h-10 flex-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {TYPE_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setTypeFilter(f.key)}
              className={`flex-row items-center px-4 py-2 rounded-full border ${typeFilter === f.key ? "bg-hair-gold border-hair-gold" : "bg-hair-bg-dark border-hair-gold/20"}`}
            >
              <Text className="mr-1">{f.emoji}</Text>
              <Text
                className={`text-sm font-semibold ${typeFilter === f.key ? "text-white" : "text-white/60"}`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
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
          <View className="flex-row flex-wrap justify-between gap-y-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View key={i} className="w-[47%]">
                <Skeleton height={190} rounded="lg" />
              </View>
            ))}
          </View>
        ) : products.length === 0 ? (
          <EmptyState
            emoji="🧴"
            title="No products found"
            description="Try adjusting your search or filters"
          />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() =>
                  router.push(`/explore/products/${product.id}` as any)
                }
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
