import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, RefreshControl, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../../../../store/authStore';
import { communityApi, CommunityPost } from '../../../../../lib/api/community';
import { Avatar } from '../../../../../components/ui/Avatar';
import { Button } from '../../../../../components/ui/Button';
import { Skeleton, SkeletonCard } from '../../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../../components/shared/EmptyState';
import { useToast } from '../../../../../components/ui/Toast';

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function PostCard({ post, onLike, currentUserId }: {
  post: CommunityPost;
  onLike: () => void;
  currentUserId?: string;
}) {
  const isOwn = post.user.id === currentUserId;

  return (
    <View className="bg-hair-bg-dark rounded-2xl p-4 mb-4 border border-hair-gold/10">
      {/* Author row */}
      <View className="flex-row items-center mb-3">
        <Avatar
          uri={post.user.avatarUrl}
          name={`${post.user.firstName} ${post.user.lastName}`}
          size="sm"
        />
        <View className="ml-3 flex-1">
          <Text className="text-white font-semibold text-sm">
            {post.user.firstName} {post.user.lastName}
            {isOwn && <Text className="text-hair-gold"> (You)</Text>}
          </Text>
          <Text className="text-white/40 text-xs">{timeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {/* Content */}
      <Text className="text-white/90 text-sm leading-5 mb-3">{post.content}</Text>

      {/* Images */}
      {post.imageUrls.length > 0 && (
        <View className={`mb-3 gap-2 ${post.imageUrls.length > 1 ? 'flex-row flex-wrap' : ''}`}>
          {post.imageUrls.slice(0, 4).map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              className={`rounded-xl ${post.imageUrls.length === 1 ? 'w-full h-56' : 'h-36 flex-1'}`}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Like row */}
      <View className="flex-row items-center pt-2 border-t border-hair-gold/10">
        <TouchableOpacity onPress={onLike} className="flex-row items-center mr-4">
          <Text className={`text-lg mr-1 ${post.isLiked ? '' : 'opacity-50'}`}>
            {post.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text className={`text-sm font-semibold ${post.isLiked ? 'text-rose-400' : 'text-white/50'}`}>
            {post.likes}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { show: showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [postText, setPostText] = useState('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [showCompose, setShowCompose] = useState(false);

  const pickPostImage = async () => {
    if (postImages.length >= 4) {
      showToast('Maximum 4 images per post', 'error');
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Photo library access is needed to attach images');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPostImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ['community', 'group', id],
    queryFn: () => communityApi.getGroup(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['community', 'posts', id],
    queryFn: () => communityApi.getGroupPosts(id),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 min — posts change more frequently
  });

  const joinMutation = useMutation({
    mutationFn: () =>
      group?.isJoined ? communityApi.leaveGroup(id) : communityApi.joinGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', 'group', id] });
      queryClient.invalidateQueries({ queryKey: ['community', 'groups'] });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: () => communityApi.createPost(id, {
      content: postText.trim(),
      imageUrls: postImages.length > 0 ? postImages : undefined,
    }),
    onSuccess: () => {
      setPostText('');
      setPostImages([]);
      setShowCompose(false);
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', id] });
    },
    onError: () => showToast('Failed to post. Please try again.', 'error'),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => communityApi.likePost(postId),
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['community', 'posts', id] });
      const previous = queryClient.getQueryData(['community', 'posts', id]);
      queryClient.setQueryData<any>(['community', 'posts', id], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((p: any) =>
            p.id === postId
              ? { ...p, likes: p.likes + 1, isLiked: true }
              : p
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _postId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['community', 'posts', id], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['community', 'posts', id] }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['community', 'group', id] }),
        queryClient.refetchQueries({ queryKey: ['community', 'posts', id] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const group = groupData?.data;
  const posts = postsData?.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2994A" />
          }
        >
          {/* Group header */}
          {groupLoading ? (
            <Skeleton height={160} rounded="sm" />
          ) : group ? (
            <View>
              {group.coverUrl ? (
                <Image source={{ uri: group.coverUrl }} className="w-full h-44" resizeMode="cover" />
              ) : (
                <View className="w-full h-44 bg-hair-bg-light items-center justify-center">
                  <Text style={{ fontSize: 64 }}>🌿</Text>
                </View>
              )}

              {/* Back button overlay */}
              <TouchableOpacity
                onPress={() => router.push('/community/groups')}
                className="absolute top-4 left-4 bg-black/40 rounded-full px-3 py-1.5"
              >
                <Text className="text-white text-sm font-semibold">← Back</Text>
              </TouchableOpacity>

              <View className="px-6 pt-4 pb-2">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-white text-2xl font-bold mb-1">{group.name}</Text>
                    <Text className="text-white/60 text-sm">{group.description}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className={`px-5 py-2.5 rounded-full ${
                      group.isJoined ? 'border border-hair-gold/40 bg-transparent' : 'bg-hair-gold'
                    }`}
                  >
                    <Text className={`font-semibold text-sm ${group.isJoined ? 'text-hair-gold' : 'text-white'}`}>
                      {group.isJoined ? 'Joined ✓' : 'Join Group'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center mt-3 gap-4">
                  <Text className="text-white/50 text-sm">
                    👥 {group.memberCount.toLocaleString()} members
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push(`/community/groups/${id}/chat`)}
                    className="flex-row items-center bg-hair-bg-light rounded-full px-4 py-1.5"
                  >
                    <Text className="text-hair-gold text-sm font-semibold">💬 Group Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}

          {/* Compose post */}
          {group?.isJoined && (
            <View className="px-6 mt-4 mb-2">
              {showCompose ? (
                <View className="bg-hair-bg-dark rounded-2xl p-4 border border-hair-gold/20">
                  <TextInput
                    value={postText}
                    onChangeText={setPostText}
                    placeholder="Share something with the group..."
                    placeholderTextColor="#7a6a5a"
                    multiline
                    numberOfLines={4}
                    className="text-white text-sm leading-5 mb-3"
                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                    autoFocus
                  />
                  {/* Image previews */}
                  {postImages.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mb-3">
                      {postImages.map((uri, i) => (
                        <View key={i} className="relative">
                          <Image
                            source={{ uri }}
                            style={{ width: 72, height: 72, borderRadius: 10 }}
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            onPress={() => setPostImages(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {postImages.length < 4 && (
                        <TouchableOpacity
                          onPress={pickPostImage}
                          style={{ width: 72, height: 72, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(210,153,74,0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Text style={{ fontSize: 20 }}>+</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  {/* Bottom toolbar */}
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                      onPress={pickPostImage}
                      disabled={postImages.length >= 4}
                      className="w-9 h-9 rounded-xl bg-hair-bg-light items-center justify-center"
                    >
                      <Text className="text-base">🖼️</Text>
                    </TouchableOpacity>
                    <View className="flex-1" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => { setShowCompose(false); setPostText(''); setPostImages([]); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => createPostMutation.mutate()}
                      disabled={(!postText.trim() && postImages.length === 0) || createPostMutation.isPending}
                      isLoading={createPostMutation.isPending}
                    >
                      Post
                    </Button>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => setShowCompose(true)}
                  className="flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/20"
                >
                  <Avatar
                    name={`${user?.firstName} ${user?.lastName}`}
                    uri={user?.avatarUrl}
                    size="sm"
                  />
                  <Text className="text-white/40 text-sm ml-3">Share something with the group...</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Posts feed */}
          <View className="px-6 mt-4">
            <Text className="text-white text-lg font-bold mb-4">
              {posts.length > 0 ? `${posts.length} Posts` : 'Posts'}
            </Text>

            {postsLoading ? (
              <View className="gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            ) : posts.length === 0 ? (
              <EmptyState
                emoji="🌱"
                title="No posts yet"
                description={group?.isJoined
                  ? "Be the first to share something with this group!"
                  : "Join this group to see and create posts."}
                actionLabel={group?.isJoined ? "Write a post" : undefined}
                onAction={group?.isJoined ? () => setShowCompose(true) : undefined}
              />
            ) : (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={() => likeMutation.mutate(post.id)}
                  currentUserId={user?.id}
                />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
