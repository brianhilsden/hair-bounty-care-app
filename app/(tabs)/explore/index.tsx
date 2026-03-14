import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { salonsApi } from "../../../lib/api/salons";
import { productsApi } from "../../../lib/api/products";
import { blogApi } from "../../../lib/api/blog";
import { recommendationsApi } from "../../../lib/api/recommendations";
import { newsletterApi } from "../../../lib/api/newsletter";
import { useCartStore } from "../../../store/cartStore";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";
import { LinearGradient } from "expo-linear-gradient";

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-white text-lg font-bold">{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text className="text-hair-gold text-sm font-semibold">See All →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const { show: showToast } = useToast();
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const totalItems = useCartStore((s) => s.totalItems());

  const { data: salonsData, isLoading: salonsLoading } = useQuery({
    queryKey: ["salons", {}],
    queryFn: () => salonsApi.getSalons({ limit: 3 }),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", {}],
    queryFn: () => productsApi.getProducts({ limit: 4 }),
  });

  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: ["blog", {}],
    queryFn: () => blogApi.getPosts({ limit: 3 }),
  });

  const { data: recsData, isLoading: recsLoading } = useQuery({
    queryKey: ["recommendations", "products"],
    queryFn: () => recommendationsApi.getProducts(),
  });

  const subscribeMutation = useMutation({
    mutationFn: () => newsletterApi.subscribe(email),
    onSuccess: () => {
      showToast("Successfully subscribed to the newsletter! 🎉", "success");
      setEmail("");
    },
    onError: () => {
      showToast("Failed to subscribe. Please try again.", "error");
    },
  });

  const salons = salonsData?.data ?? [];
  const products = productsData?.data ?? [];
  const posts = blogData?.data ?? [];
  const recommendedProducts = recsData?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white">Explore ✨</Text>
            <Text className="text-white/60 text-sm">
              Salons, products & hair tips
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/explore/products/cart")}
            className="relative"
          >
            <View className="w-10 h-10 bg-hair-bg-dark rounded-full items-center justify-center border border-hair-gold/20">
              <Text className="text-xl">🛒</Text>
            </View>
            {totalItems > 0 && (
              <View className="absolute -top-1 -right-1 w-5 h-5 bg-hair-gold rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View className="mx-6 mb-5 flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/20">
          <Text className="text-white/40 mr-2">🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={() => {
              if (search.trim()) router.push(`/explore/products`);
            }}
            placeholder="Search salons, products..."
            placeholderTextColor="#7a6a5a"
            className="flex-1 text-white text-sm"
            returnKeyType="search"
          />
        </View>

        {/* Quick links */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        >
          {[
            { emoji: "💈", label: "Salons", route: "/(tabs)/explore/salons" },
            {
              emoji: "🧴",
              label: "Products",
              route: "/(tabs)/explore/products",
            },
            {
              emoji: "🌿",
              label: "DIY Oils",
              route: "/(tabs)/explore/products",
            },
            { emoji: "📖", label: "Blog", route: "/(tabs)/explore/blog" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.route as any)}
              className="items-center bg-hair-bg-dark rounded-2xl px-5 py-3 border border-hair-gold/10 min-w-16"
            >
              <Text className="text-2xl mb-1">{item.emoji}</Text>
              <Text className="text-white/70 text-xs font-semibold">
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Salons preview */}
        <View className="px-6 mb-6">
          <SectionHeader
            title="💈 Nearby Salons"
            onSeeAll={() => router.push("/explore/salons")}
          />
          {salonsLoading ? (
            <View className="gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={72} rounded="lg" />
              ))}
            </View>
          ) : salons.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/explore/salons')}
              className="bg-hair-bg-dark rounded-2xl p-5 items-center border border-hair-gold/10"
            >
              <Text className="text-4xl mb-2">💈</Text>
              <Text className="text-white font-semibold mb-1">
                Find Salons Near You
              </Text>
              <Text className="text-hair-gold text-sm">Browse salons →</Text>
            </TouchableOpacity>
          ) : (
            <View className="gap-3">
              {salons.map((salon) => (
                <TouchableOpacity
                  key={salon.id}
                  onPress={() =>
                    router.push(`/explore/salons/${salon.id}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/10">
                    <View className="w-11 h-11 rounded-xl bg-hair-gold/20 items-center justify-center mr-3">
                      <Text className="text-2xl">💈</Text>
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-white font-semibold text-sm"
                        numberOfLines={1}
                      >
                        {salon.name}
                      </Text>
                      <Text className="text-white/40 text-xs">
                        {salon.city} · ⭐ {salon.rating.toFixed(1)}
                      </Text>
                    </View>
                    <Text className="text-hair-gold text-base">→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recommended For You */}
        <View className="mb-6">
          <View className="px-6">
            <Text className="text-white text-lg font-bold mb-3">
              ✨ Recommended for You
            </Text>
          </View>
          {recsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={160} width={240} rounded="lg" />
              ))}
            </ScrollView>
          ) : recommendedProducts.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {recommendedProducts.map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  onPress={() =>
                    router.push(`/explore/products/${rec.id}` as any)
                  }
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["rgba(210, 153, 74, 0.15)", "rgba(30,30,30,0.8)"]}
                    className="w-60 rounded-2xl p-4 border border-hair-gold/20 mr-2"
                  >
                    <View className="flex-row items-start mb-3">
                      <View className="w-12 h-12 bg-hair-gold/20 rounded-full items-center justify-center mr-3">
                        <Text className="text-2xl">🧴</Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-white font-bold text-sm"
                          numberOfLines={2}
                        >
                          {rec.name}
                        </Text>
                        <Text className="text-hair-gold text-xs font-semibold">
                          {rec.brand}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <Text className="text-white/70 text-xs italic">
                        "{rec.reason}"
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* Products preview */}
        <View className="px-6 mb-6">
          <SectionHeader
            title="🧴 Shop Products"
            onSeeAll={() => router.push("/explore/products")}
          />
          {productsLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={140} width={120} rounded="lg" />
              ))}
            </ScrollView>
          ) : products.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/explore/products')}
              className="bg-hair-bg-dark rounded-2xl p-5 items-center border border-hair-gold/10"
            >
              <Text className="text-4xl mb-2">🧴</Text>
              <Text className="text-white font-semibold mb-1">
                Browse Our Products
              </Text>
              <Text className="text-hair-gold text-sm">Shop now →</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
            >
              {products.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() =>
                    router.push(`/explore/products/${product.id}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <View className="bg-hair-bg-dark rounded-2xl border border-hair-gold/10 overflow-hidden w-32">
                    <View className="h-20 bg-hair-gold/10 items-center justify-center">
                      <Text className="text-4xl">🧴</Text>
                    </View>
                    <View className="p-2.5">
                      <Text
                        className="text-white text-xs font-semibold"
                        numberOfLines={2}
                      >
                        {product.name}
                      </Text>
                      <Text className="text-hair-gold text-xs font-bold mt-1">
                        KES {product.price.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Blog preview */}
        <View className="px-6 mb-8">
          <SectionHeader
            title="📖 Hair Tips & Blog"
            onSeeAll={() => router.push("/explore/blog")}
          />
          {blogLoading ? (
            <View className="gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={72} rounded="lg" />
              ))}
            </View>
          ) : posts.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/explore/blog')}
              className="bg-hair-bg-dark rounded-2xl p-5 items-center border border-hair-gold/10"
            >
              <Text className="text-4xl mb-2">📖</Text>
              <Text className="text-white font-semibold mb-1">
                Explore Hair Tips
              </Text>
              <Text className="text-hair-gold text-sm">Read articles →</Text>
            </TouchableOpacity>
          ) : (
            <View className="gap-3">
              {posts.map((post) => (
                <TouchableOpacity
                  key={post.id}
                  onPress={() =>
                    router.push(`/explore/blog/${post.slug}` as any)
                  }
                  activeOpacity={0.85}
                >
                  <View className="flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/10">
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-white font-semibold text-sm"
                        numberOfLines={2}
                      >
                        {post.title}
                      </Text>
                      <Text className="text-white/40 text-xs mt-1">
                        {post.readTime} min read · {post.category}
                      </Text>
                    </View>
                    <Text className="text-hair-gold text-base">→</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Newsletter Subscription */}
        <View className="px-6 mb-6">
          <LinearGradient
            colors={["#2A261F", "#1A1814"]}
            className="rounded-3xl p-6 border border-hair-gold/30 items-center"
          >
            <Text className="text-4xl mb-2">💌</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Join Our Newsletter
            </Text>
            <Text className="text-white/60 text-center text-sm mb-5">
              Get exclusive hair care tips, product discounts, and community
              news delivered to your inbox.
            </Text>
            <View className="w-full flex-row items-center bg-black/40 rounded-full border border-hair-gold/20 p-1">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor="#7a6a5a"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 text-white text-sm px-4 py-3"
              />
              <TouchableOpacity
                onPress={() => {
                  if (email.trim()) subscribeMutation.mutate();
                }}
                disabled={subscribeMutation.isPending}
                className={`rounded-full px-5 py-3 ${subscribeMutation.isPending ? "bg-hair-gold/50" : "bg-hair-gold"}`}
              >
                <Text className="text-white font-bold">
                  {subscribeMutation.isPending ? "Joining" : "Subscribe"}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
