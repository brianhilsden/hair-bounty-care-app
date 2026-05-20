import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { blogApi, BlogPost } from "../../../../lib/api/blog";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { EmptyState } from "../../../../components/shared/EmptyState";

function FeaturedPostCard({
  post,
  onPress,
}: {
  post: BlogPost;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} className="mb-6">
      <View className="bg-hair-bg-dark rounded-3xl overflow-hidden border border-hair-gold/20">
        <Image
          source={{ uri: post.coverUrl }}
          className="w-full h-56"
          resizeMode="cover"
        />
        <View className="p-5">
          <View className="flex-row items-center mb-3">
            <View className="bg-hair-gold/20 px-3 py-1 rounded-full mr-3">
              <Text className="text-hair-gold text-[10px] font-bold uppercase tracking-wider">
                {post.category}
              </Text>
            </View>
            <Text className="text-white/50 text-xs">
              {new Date(post.publishedAt).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <Text className="text-white text-xl font-bold leading-tight mb-2">
            {post.title}
          </Text>
          <Text
            className="text-white/70 text-sm leading-relaxed mb-4"
            numberOfLines={2}
          >
            {post.excerpt}
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {post.authorAvatar ? (
                <Image
                  source={{ uri: post.authorAvatar }}
                  className="w-6 h-6 rounded-full mr-2"
                />
              ) : (
                <View className="w-6 h-6 rounded-full bg-hair-gold/20 mr-2 items-center justify-center">
                  <Text className="text-[10px] text-hair-gold font-bold">
                    {post.author.charAt(0)}
                  </Text>
                </View>
              )}
              <Text className="text-white/80 text-xs font-medium">
                {post.author}
              </Text>
            </View>
            <Text className="text-white/40 text-xs">
              {post.readTime} min read
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RegularPostCard({
  post,
  onPress,
}: {
  post: BlogPost;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} className="mb-4">
      <View className="flex-row items-center bg-hair-bg-dark rounded-2xl p-3 border border-hair-gold/10">
        <Image
          source={{ uri: post.coverUrl }}
          className="w-24 h-24 rounded-xl mr-4"
          resizeMode="cover"
        />
        <View className="flex-1 justify-center">
          <Text className="text-hair-gold text-[10px] font-bold uppercase tracking-wider mb-1">
            {post.category}
          </Text>
          <Text
            className="text-white font-bold text-sm leading-snug mb-1"
            numberOfLines={2}
          >
            {post.title}
          </Text>
          <Text className="text-white/50 text-xs mt-1">
            {new Date(post.publishedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            })}{" "}
            · {post.readTime} min read
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function BlogListingScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categoriesData } = useQuery({
    queryKey: ["blog", "categories"],
    queryFn: blogApi.getCategories,
    staleTime: 30 * 60 * 1000, // 30 min — categories rarely change
  });

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog", "posts", selectedCategory],
    queryFn: () =>
      blogApi.getPosts({ category: selectedCategory || undefined }),
    staleTime: 15 * 60 * 1000, // 15 min — new posts don't appear by the minute
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ["blog"] });
    } finally {
      setRefreshing(false);
    }
  };

  const categories = categoriesData?.data ?? ["Tips", "Products", "Routines"];
  const allPosts = postsData?.data ?? [];

  const isSearching = debouncedSearch.trim().length > 0;
  const posts = isSearching
    ? allPosts.filter((p) => {
        const q = debouncedSearch.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q) ||
          p.author?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
        );
      })
    : allPosts;

  const featuredPost = !isSearching && posts.length > 0 ? posts[0] : null;
  const regularPosts = isSearching ? posts : posts.slice(1);

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      {/* Header */}
      <View className="px-4 pt-4 pb-3 bg-hair-bg-dark border-b border-hair-gold/10">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Text className="text-hair-gold text-lg font-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white flex-1">
            Hair Tips & Blog 📖
          </Text>
        </View>
        <View className="flex-row items-center bg-hair-bg rounded-2xl px-4 py-2.5 border border-hair-gold/20">
          <Text className="text-white/40 mr-2">🔍</Text>
          <TextInput
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              if (v.trim()) setSelectedCategory(null);
            }}
            placeholder="Search articles..."
            placeholderTextColor="#7a6a5a"
            className="flex-1 text-white text-sm"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text className="text-white/40 text-base">✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

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
        {/* Categories */}
        <View className="py-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className={`px-5 py-2 rounded-full border ${!selectedCategory ? "bg-hair-gold border-hair-gold" : "bg-transparent border-hair-gold/30"}`}
            >
              <Text
                className={`font-semibold text-sm ${!selectedCategory ? "text-black" : "text-white"}`}
              >
                Latest
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full border ${selectedCategory === cat ? "bg-hair-gold border-hair-gold" : "bg-transparent border-hair-gold/30"}`}
              >
                <Text
                  className={`font-semibold text-sm ${selectedCategory === cat ? "text-black" : "text-white"}`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6">
          {isLoading ? (
            <View className="gap-6 mt-2">
              <View className="rounded-3xl overflow-hidden">
                <Skeleton height={224} rounded="md" />
                <View className="p-5 bg-hair-bg-dark border-x border-b border-hair-gold/20 rounded-b-3xl gap-3">
                  <Skeleton width="40%" height={16} rounded="sm" />
                  <Skeleton width="100%" height={24} rounded="sm" />
                  <Skeleton width="80%" height={24} rounded="sm" />
                </View>
              </View>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="flex-row items-center gap-4 bg-hair-bg-dark p-3 rounded-2xl border border-hair-gold/10"
                >
                  <Skeleton height={96} width={96} rounded="lg" />
                  <View className="flex-1 gap-2">
                    <Skeleton height={14} width="30%" rounded="sm" />
                    <Skeleton height={40} width="100%" rounded="sm" />
                    <Skeleton height={14} width="50%" rounded="sm" />
                  </View>
                </View>
              ))}
            </View>
          ) : posts.length === 0 ? (
            <View className="mt-10">
              <EmptyState
                emoji={isSearching ? "🔍" : "📝"}
                title={isSearching ? `No results for "${debouncedSearch}"` : "No articles found"}
                description={isSearching ? "Try different keywords" : "Check back soon for new articles!"}
              />
            </View>
          ) : (
            <>
              {featuredPost && (
                <FeaturedPostCard
                  post={featuredPost}
                  onPress={() =>
                    router.push(
                      `/(tabs)/explore/blog/${featuredPost.slug}` as any,
                    )
                  }
                />
              )}

              {regularPosts.length > 0 && (
                <View className="mt-2">
                  <Text className="text-white text-lg font-bold mb-4">
                    {isSearching ? `Results for "${debouncedSearch}"` : "More Articles"}
                  </Text>
                  {regularPosts.map((post) => (
                    <RegularPostCard
                      key={post.id}
                      post={post}
                      onPress={() =>
                        router.push(`/explore/blog/${post.slug}` as any)
                      }
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
