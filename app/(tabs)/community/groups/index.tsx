import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { communityApi, CommunityGroup } from '../../../../lib/api/community';
import { Avatar } from '../../../../components/ui/Avatar';
import { Skeleton } from '../../../../components/ui/Skeleton';
import { EmptyState } from '../../../../components/shared/EmptyState';

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  braids:     { emoji: '🪢', color: 'bg-amber-500/20 border-amber-500/30' },
  locs:       { emoji: '🌿', color: 'bg-green-500/20 border-green-500/30' },
  natural:    { emoji: '🌀', color: 'bg-purple-500/20 border-purple-500/30' },
  relaxed:    { emoji: '✨', color: 'bg-blue-500/20 border-blue-500/30' },
  protective: { emoji: '🛡️', color: 'bg-pink-500/20 border-pink-500/30' },
  coloring:   { emoji: '🎨', color: 'bg-orange-500/20 border-orange-500/30' },
  default:    { emoji: '💇', color: 'bg-hair-gold/20 border-hair-gold/30' },
};

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category?.toLowerCase()] ?? CATEGORY_CONFIG.default;
}

function GroupCard({ group, onPress, onJoin, isJoining }: {
  group: CommunityGroup;
  onPress: () => void;
  onJoin: () => void;
  isJoining: boolean;
}) {
  const config = getCategoryConfig(group.category);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <View className="bg-hair-bg-dark rounded-2xl overflow-hidden border border-hair-gold/10 mb-4">
        {/* Cover */}
        {group.coverUrl ? (
          <Image source={{ uri: group.coverUrl }} className="w-full h-32" resizeMode="cover" />
        ) : (
          <View className={`w-full h-32 items-center justify-center ${config.color} border-0`}>
            <Text style={{ fontSize: 56 }}>{config.emoji}</Text>
          </View>
        )}

        <View className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-white text-lg font-bold mb-1">{group.name}</Text>
              <Text className="text-white/60 text-sm" numberOfLines={2}>{group.description}</Text>
            </View>
            <TouchableOpacity
              onPress={onJoin}
              disabled={isJoining}
              className={`px-4 py-2 rounded-full border ${
                group.isJoined
                  ? 'border-hair-gold/30 bg-transparent'
                  : 'border-transparent bg-hair-gold'
              }`}
            >
              <Text className={`text-sm font-semibold ${group.isJoined ? 'text-hair-gold' : 'text-white'}`}>
                {group.isJoined ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mt-1">
            <View className={`px-2 py-0.5 rounded-full border ${config.color}`}>
              <Text className="text-white/70 text-xs capitalize">{config.emoji} {group.category}</Text>
            </View>
            <Text className="text-white/40 text-xs ml-3">
              {group.memberCount.toLocaleString()} members
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function GroupsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: groupsData, isLoading } = useQuery({
    queryKey: ['community', 'groups'],
    queryFn: communityApi.getGroups,
    staleTime: 5 * 60 * 1000,
  });

  const joinMutation = useMutation({
    mutationFn: ({ id, isJoined }: { id: string; isJoined: boolean }) =>
      isJoined ? communityApi.leaveGroup(id) : communityApi.joinGroup(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['community', 'groups'] }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['community', 'groups'] });
    } finally {
      setRefreshing(false);
    }
  };

  const allGroups = groupsData?.data ?? [];
  const groups = debouncedSearch.trim()
    ? allGroups.filter(g =>
        g.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        g.category.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        g.description.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : allGroups;

  return (
    <SafeAreaView className="flex-1 bg-hair-bg">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#D2994A" />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-2 flex-row items-center">
          <TouchableOpacity onPress={() => router.push("/community")} className="mr-4">
            <Text className="text-hair-gold text-base">← Back</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-3xl font-bold text-white">Hair Groups</Text>
            <Text className="text-white/60 text-sm">Find your tribe</Text>
          </View>
        </View>

        {/* Search */}
        <View className="mx-6 mt-4 mb-2 flex-row items-center bg-hair-bg-dark rounded-2xl px-4 py-3 border border-hair-gold/20">
          <Text className="text-white/40 mr-2">🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search groups..."
            placeholderTextColor="#7a6a5a"
            className="flex-1 text-white text-sm"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text className="text-white/40 text-base">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="px-6 mt-4">
          {isLoading ? (
            <View className="gap-4">
              {[...Array(4)].map((_, i) => (
                <View key={i} className="bg-hair-bg-dark rounded-2xl overflow-hidden">
                  <Skeleton height={128} rounded="sm" />
                  <View className="p-4 gap-2">
                    <Skeleton height={18} width="60%" rounded="md" />
                    <Skeleton height={12} rounded="sm" />
                    <Skeleton height={12} width="80%" rounded="sm" />
                  </View>
                </View>
              ))}
            </View>
          ) : groups.length === 0 ? (
            <EmptyState
              emoji={debouncedSearch ? "🔍" : "🌿"}
              title={debouncedSearch ? `No results for "${debouncedSearch}"` : "No groups yet"}
              description={debouncedSearch ? "Try different keywords" : "Hair groups are being set up. Check back soon!"}
            />
          ) : (
            groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => router.push(`/community/groups/${group.id}`)}
                onJoin={() => joinMutation.mutate({ id: group.id, isJoined: !!group.isJoined })}
                isJoining={joinMutation.isPending}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
