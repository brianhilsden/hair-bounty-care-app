import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { blogApi } from "../../../../lib/api/blog";
import { Skeleton } from "../../../../components/ui/Skeleton";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";

const { width } = Dimensions.get("window");

export default function BlogPostDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["blog", "post", slug],
    queryFn: () => blogApi.getPost(slug),
    enabled: !!slug,
  });

  const post = data?.data;

  const handleShare = async () => {
    if (!post) return;
    await Share.share({
      message: `${post.title}\n\nRead more on Hair Bounty Care`,
      title: post.title,
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-hair-bg">
        <Skeleton height={width * 0.8} rounded="md" />
        <View className="px-6 py-6 gap-4">
          <Skeleton width="30%" height={24} rounded="sm" />
          <Skeleton width="100%" height={40} rounded="sm" />
          <View className="flex-row items-center gap-3 mt-2">
            <Skeleton width={40} height={40} rounded="full" />
            <Skeleton width="40%" height={20} rounded="sm" />
          </View>
          <View className="mt-8 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} width="100%" height={16} rounded="sm" />
            ))}
          </View>
        </View>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 bg-hair-bg items-center justify-center p-6">
        <Text className="text-4xl mb-4">😢</Text>
        <Text className="text-white text-xl font-bold text-center mb-2">
          Post not found
        </Text>
        <Text className="text-white/60 text-center mb-8">
          This article might have been moved or deleted.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-hair-gold px-6 py-3 rounded-full"
        >
          <Text className="text-white font-bold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-hair-bg">
      <StatusBar style="light" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View className="relative w-full" style={{ height: width }}>
          <Image
            source={{ uri: post.coverUrl }}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />
          <LinearGradient
            colors={[
              "rgba(25, 23, 20, 0)",
              "rgba(25, 23, 20, 0.8)",
              "rgba(25, 23, 20, 1)",
            ]}
            className="absolute inset-0"
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

          {/* Top Nav (Floating) */}
          <View className="absolute top-14 left-0 right-0 px-4 flex-row justify-between items-center z-10">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
            >
              <Text className="text-white text-xl">←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center border border-white/10"
            >
              <Text className="text-white text-xl">📤</Text>
            </TouchableOpacity>
          </View>

          {/* Hero Content */}
          <View className="absolute bottom-0 px-6 pb-6 w-full">
            <View className="flex-row items-center mb-4">
              <View className="bg-hair-gold/90 px-3 py-1 rounded-full mr-3 border border-hair-gold/50">
                <Text className="text-black text-[10px] font-bold uppercase tracking-wider">
                  {post.category}
                </Text>
              </View>
              <Text className="text-white/70 text-sm font-medium">
                {post.readTime} min read
              </Text>
            </View>
            <Text className="text-white text-3xl font-extrabold leading-tight mb-4">
              {post.title}
            </Text>
            <Text
              className="text-white/80 text-base leading-relaxed mb-6"
              numberOfLines={3}
            >
              {post.excerpt}
            </Text>
          </View>
        </View>

        {/* Content Body */}
        <View className="px-6 py-4">
          {/* Author Info */}
          <View className="flex-row items-center justify-between pb-6 border-b border-hair-gold/10 mb-6">
            <View className="flex-row items-center">
              {post.authorAvatar ? (
                <Image
                  source={{ uri: post.authorAvatar }}
                  className="w-12 h-12 rounded-full mr-3 border-2 border-hair-gold/30"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-hair-gold/20 mr-3 items-center justify-center border-2 border-hair-gold/30">
                  <Text className="text-lg text-hair-gold font-bold">
                    {post.author.charAt(0)}
                  </Text>
                </View>
              )}
              <View>
                <Text className="text-white font-bold text-base">
                  {post.author}
                </Text>
                <Text className="text-white/50 text-xs">
                  Published{" "}
                  {new Date(post.publishedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>
            </View>
          </View>

          {/* Actual Article Content */}
          <View className="mb-10">
            <Markdown
              style={{
                body: {
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 16,
                  lineHeight: 28,
                },
                heading1: {
                  color: "white",
                  marginTop: 16,
                  marginBottom: 8,
                  fontSize: 24,
                  fontWeight: "bold",
                },
                heading2: {
                  color: "white",
                  marginTop: 16,
                  marginBottom: 8,
                  fontSize: 20,
                  fontWeight: "bold",
                },
                heading3: {
                  color: "white",
                  marginTop: 16,
                  marginBottom: 8,
                  fontSize: 18,
                  fontWeight: "bold",
                },
                paragraph: { marginBottom: 16 },
                list_item: { marginTop: 4, marginBottom: 4 },
                bullet_list: { marginBottom: 16 },
                ordered_list: { marginBottom: 16 },
                strong: { color: "white", fontWeight: "bold" },
              }}
            >
              {post.content || post.excerpt}
            </Markdown>
          </View>

          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-10">
            {post.tags.map((tag) => (
              <View
                key={tag}
                className="bg-hair-bg-dark border border-hair-gold/20 rounded-full px-4 py-2"
              >
                <Text className="text-hair-gold text-xs font-semibold">
                  #{tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
