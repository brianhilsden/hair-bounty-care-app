import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Image, RefreshControl, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuthStore } from '../../../../../store/authStore';
import { communityApi, CommunityPost } from '../../../../../lib/api/community';
import { Avatar } from '../../../../../components/ui/Avatar';
import { Button } from '../../../../../components/ui/Button';
import { Skeleton, SkeletonCard } from '../../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../../components/shared/EmptyState';

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
  const [refreshing, setRefreshing] = useState(false);
  const [postText, setPostText] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ['community', 'group', id],
    queryFn: () => communityApi.getGroup(id),
    enabled: !!id,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['community', 'posts', id],
    queryFn: () => communityApi.getGroupPosts(id),
    enabled: !!id,
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
    mutationFn: () => communityApi.createPost(id, { content: postText.trim() }),
    onSuccess: () => {
      setPostText('');
      setShowCompose(false);
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', id] });
    },
    onError: () => Alert.alert('Error', 'Failed to post. Please try again.'),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => communityApi.likePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'posts', id] }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['community', 'group', id] }),
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', id] }),
    ]);
    setRefreshing(false);
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
                  <View className="flex-row gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() => { setShowCompose(false); setPostText(''); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => createPostMutation.mutate()}
                      disabled={!postText.trim() || createPostMutation.isPending}
                      isLoading={createPostMutation.isPending}
                      className="flex-1"
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
